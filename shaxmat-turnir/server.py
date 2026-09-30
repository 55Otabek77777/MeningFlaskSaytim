#!/usr/bin/env python3
# «Mirzo Ulugʻbek» xususiy maktabi — shaxmat turniri serveri (olimpiya tizimi: yutqazgan chiqib ketadi).
# Faqat Python standart kutubxonasi — hech narsa o'rnatish shart emas.  Ishga tushirish:  python server.py
# Bir kompyuterda ishlaydi, qolgan kompyuterlar shu tarmoqdan brauzer orqali ulanadi (internet shart emas).
import json, os, sys, time, threading, secrets, socket, re, csv, io, shutil, mimetypes
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

HERE = os.path.dirname(os.path.abspath(__file__))
STATIC = os.path.join(HERE, 'static')
DATA = os.path.join(HERE, 'data')
STATE_FILE = os.path.join(DATA, 'turnir.json')
NAMES_FILE = os.path.join(HERE, 'oquvchilar.txt')
PORT = int(os.environ.get('PORT', '8000'))
START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
GROUP_NAMES = {'B': 'Oʻgʻil bolalar', 'G': 'Qizlar'}
PRIZES = {1: 500000, 2: 300000, 3: 200000}
RESULT_HOLD = float(os.environ.get('RESULT_HOLD', '12'))   # natija taxtada necha soniya ko'rinib turadi, keyin navbatdagi o'yin
rng = secrets.SystemRandom()
LOCK = threading.RLock()
COND = threading.Condition(LOCK)
S = None                    # holat (state)


def now_ms():
    return int(time.time() * 1000)


# ---------------- o'quvchilar ro'yxati ----------------
def norm_head(s):
    return re.sub(r"[ʻʼ'’‘`]", '', s.lower())


def read_names_file():
    """oquvchilar.txt: [OʻGʻIL BOLALAR] / [QIZLAR] sarlavhalari, har qatorda «Familiya Ism | sinf»."""
    out = {'B': [], 'G': []}
    if not os.path.exists(NAMES_FILE):
        return out
    grp = None
    with open(NAMES_FILE, encoding='utf-8-sig') as f:
        for raw in f:
            line = raw.strip()
            if not line or line.startswith('//'):
                continue
            h = norm_head(line)
            if line.startswith('[') or line.startswith('#'):
                if 'qiz' in h:
                    grp = 'G'
                elif 'ogil' in h or 'bola' in h:
                    grp = 'B'
                continue
            if grp is None:
                continue
            name, _, sinf = line.partition('|')
            name = ' '.join(name.split())
            if name:
                out[grp].append({'name': name, 'sinf': sinf.strip()})
    return out


def make_players(lists):
    players = {}
    for g in ('B', 'G'):
        for i, p in enumerate(lists.get(g, []), 1):
            pid = f'{g}{i:02d}'
            players[pid] = {'id': pid, 'g': g, 'name': p['name'].strip(), 'sinf': p.get('sinf', '').strip()}
    return players


# ---------------- holat ----------------
def new_state():
    return {
        'v': 1, 'rev': 1, 'phase': 'setup', 'paused': False,
        'config': {'boards': 2, 'tc_min': 5, 'tc_inc': 3, 'arm_w': 5, 'arm_b': 4},
        'players': make_players(read_names_file()),
        'matches': {}, 'rounds': {'B': [], 'G': []}, 'bronze': {}, 'games': {},
        'boards': [{'id': i + 1, 'on': True, 'game': None, 'hold_until': 0} for i in range(2)],
        'drawn_at': None, 'started_at': None, 'finished_at': None, 'log': []
    }


def save():
    S['saved_at'] = now_ms()
    os.makedirs(DATA, exist_ok=True)
    tmp = STATE_FILE + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(S, f, ensure_ascii=False)
    os.replace(tmp, STATE_FILE)


def load():
    global S
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, encoding='utf-8') as f:
            S = json.load(f)
        pause_clocks(now_ms() - S.get('saved_at', now_ms()))     # server oʻchiq turgan vaqt soatlardan ayirilmaydi
    else:
        S = new_state()
        save()


def changed(msg=None):
    """Har bir o'zgarishdan keyin: rev++, saqlash, kutayotgan ekranlarni uyg'otish."""
    S['rev'] += 1
    if msg:
        S['log'].append([now_ms(), msg])
        S['log'] = S['log'][-300:]
    save()
    COND.notify_all()


def pname(pid):
    p = S['players'].get(pid) if pid else None
    return p['name'] if p else '—'


# ---------------- jerebyovka va jadval (olimpiya tizimi) ----------------
def round_title(g, r):
    total = len(S['rounds'][g])
    left = total - r              # finalgacha qolgan bosqichlar
    if left == 1:
        return 'Final'
    if left == 2:
        return 'Yarim final'
    if left == 3:
        return 'Chorak final'
    if r == 0 and any(S['matches'][m]['bye'] for m in S['rounds'][g][0]):
        return 'Saralash bosqichi'
    return f'1/{2 ** (left - 1)} final'


def build_bracket(g):
    ids = [pid for pid, p in S['players'].items() if p['g'] == g]
    n = len(ids)
    S['rounds'][g] = []
    S['bronze'].pop(g, None)
    if n < 2:
        return
    size = 1
    while size < n:
        size *= 2
    R = size.bit_length() - 1
    order = ids[:]
    rng.shuffle(order)
    first = size // 2
    byes = size - n
    bits = max(1, (first - 1).bit_length())
    spread = sorted(range(first), key=lambda i: int(format(i, f'0{bits}b')[::-1], 2))
    bye_set = set(spread[:byes])            # bo'sh juftliklar jadval bo'ylab tekis taqsimlanadi
    for r in range(R):
        col = []
        for s in range(size >> (r + 1)):
            mid = f'{g}{r + 1}-{s + 1:02d}'
            S['matches'][mid] = {'id': mid, 'g': g, 'r': r, 's': s, 'p': [None, None], 'winner': None, 'loser': None,
                                 'status': 'wait', 'games': [], 'bye': False, 'bronze': False, 'note': ''}
            col.append(mid)
        S['rounds'][g].append(col)
    if n >= 4:                                  # 3 nafarda yarim finalda bitta yutqazgan boʻladi — 3-oʻrin oʻyini yoʻq
        mid = f'{g}-3orin'
        S['matches'][mid] = {'id': mid, 'g': g, 'r': R - 1, 's': 1, 'p': [None, None], 'winner': None, 'loser': None,
                             'status': 'wait', 'games': [], 'bye': False, 'bronze': True, 'note': ''}
        S['bronze'][g] = mid
    it = iter(order)
    for s, mid in enumerate(S['rounds'][g][0]):
        m = S['matches'][mid]
        if s in bye_set:
            m['p'] = [next(it), None]
            m['bye'] = True
        else:
            m['p'] = [next(it), next(it)]


def set_result(m, winner, note=''):
    m['winner'] = winner
    m['loser'] = m['p'][1] if m['p'][0] == winner else m['p'][0]
    m['status'] = 'done'
    if note:
        m['note'] = note
    if m['bronze']:
        return
    g, r, s = m['g'], m['r'], m['s']
    rounds = S['rounds'][g]
    if r + 1 < len(rounds):
        nxt = S['matches'][rounds[r + 1][s // 2]]
        nxt['p'][s % 2] = winner
    if r == len(rounds) - 2 and g in S['bronze'] and m['loser']:
        S['matches'][S['bronze'][g]]['p'][s % 2] = m['loser']


def resolve():
    """Bo'sh juftliklar (avtomatik o'tish) va tayyor bo'lgan juftliklarni belgilaydi."""
    again = True
    while again:
        again = False
        for m in S['matches'].values():
            if m['status'] != 'wait':
                continue
            if m['bye'] and m['p'][0]:
                set_result(m, m['p'][0], 'avtomatik oʻtdi')
                m['status'] = 'bye'
                again = True
            elif m['p'][0] and m['p'][1]:
                m['status'] = 'ready'
                again = True
    check_finished()


def check_finished():
    if S['phase'] != 'running':
        return
    for g in ('B', 'G'):
        if not S['rounds'][g]:
            continue
        final = S['matches'][S['rounds'][g][-1][0]]
        if final['status'] != 'done':
            return
        if g in S['bronze'] and S['matches'][S['bronze'][g]]['status'] != 'done':
            return
    S['phase'] = 'finished'
    S['finished_at'] = now_ms()


def standings(g):
    if not S['rounds'].get(g):
        return []
    final = S['matches'][S['rounds'][g][-1][0]]
    out = []
    if final['status'] == 'done':
        out += [{'place': 1, 'id': final['winner']}, {'place': 2, 'id': final['loser']}]
    b = S['bronze'].get(g)
    if b and S['matches'][b]['status'] == 'done':
        out.append({'place': 3, 'id': S['matches'][b]['winner']})
    elif not b and final['status'] == 'done' and len(S['rounds'][g]) == 2:
        semi = [S['matches'][x]['loser'] for x in S['rounds'][g][0] if S['matches'][x]['loser']]
        if len(semi) == 1:                      # 3 nafar: yarim finalda yutqazgan oʻquvchi — 3-oʻrin
            out.append({'place': 3, 'id': semi[0]})
    for o in out:
        o['name'] = pname(o['id'])
        o['prize'] = PRIZES[o['place']]
    return out


# ---------------- o'yinlar va taxtalar ----------------
def schedule():
    if S['phase'] != 'running' or S['paused']:
        return
    t = now_ms()
    for b in S['boards']:
        if not b['on']:
            continue
        if b['game']:
            gm = S['games'][b['game']]
            if gm['status'] in ('pending', 'playing') or t < b['hold_until']:
                continue
            b['game'] = None
        m = pick_match()
        if not m:
            return
        start_game(m, b)


def queue_order(limit=12):
    """Navbatdagi juftliklar — dastur ularni aynan shu tartibda taxtalarga beradi."""
    reserved = {b.get('replay') for b in S['boards'] if b.get('replay')}   # durangdan keyin o'sha taxtada qayta o'ynaydi
    ready = [m for m in S['matches'].values() if m['status'] == 'ready' and m['id'] not in reserved]
    busy = {'B': 0, 'G': 0}
    for b in S['boards']:
        if b['game'] and S['games'][b['game']]['status'] in ('pending', 'playing'):
            busy[S['games'][b['game']]['g']] += 1
        elif b.get('replay') and b['on'] and S['matches'][b['replay']]['status'] == 'ready':
            busy[S['matches'][b['replay']]['g']] += 1       # durangdan keyingi qayta oʻyin shu taxtada boshlanadi

    def key(m):
        is_final = (not m['bronze']) and m['r'] == len(S['rounds'][m['g']]) - 1
        return (0 if m['games'] else 1, m['r'], is_final, busy[m['g']], 0 if m['g'] == 'G' else 1, m['s'])
    out = []
    while ready and len(out) < limit:
        m = min(ready, key=key)
        out.append(m)
        ready.remove(m)
        busy[m['g']] += 1
    return out


def pick_match():
    q = queue_order(1)
    return q[0] if q else None


def start_game(m, board, white=None):
    n = len(m['games'])
    if white is None:
        if n == 0:
            white = rng.choice(m['p'])
        else:
            white = S['games'][m['games'][-1]]['black']     # qayta o'yinda ranglar almashadi
    black = m['p'][1] if white == m['p'][0] else m['p'][0]
    arm = n >= 2
    c = S['config']
    clock = {'w': (c['arm_w'] if arm else c['tc_min']) * 60000, 'b': (c['arm_b'] if arm else c['tc_min']) * 60000}
    S['seq'] = S.get('seq', 0) + 1
    gid = f"{m['id']}-{S['seq']}"                  # har bir o'yin id si yagona (bekor qilinganlar ham)
    S['games'][gid] = {
        'id': gid, 'match': m['id'], 'g': m['g'], 'board': board['id'], 'no': n + 1, 'armageddon': arm,
        'white': white, 'black': black, 'moves': [], 'fen': START_FEN, 'last': None,
        'clock': clock, 'inc': 0 if arm else c['tc_inc'] * 1000, 'turn': 'w', 'turn_at': None,
        'status': 'pending', 'ready': {'w': False, 'b': False}, 'draw_offer': None,
        'result': None, 'reason': None, 'created': now_ms(), 'started': None, 'ended': None, 'winner': None
    }
    m['games'].append(gid)
    m['status'] = 'playing'
    board['game'] = gid
    board['hold_until'] = 0
    S['log'].append([now_ms(), f"{board['id']}-taxta: {pname(white)} (oq) — {pname(black)} (qora)"])


def begin(gm):
    gm['status'] = 'playing'
    gm['started'] = gm['turn_at'] = now_ms()


def pause_clocks(ms):
    """Server ishlamagan vaqt (oʻchib qolgan, kompyuter uxlagan, soati surilgan) oʻyinchi soatidan ketmaydi."""
    for gm in S['games'].values():
        if gm['status'] == 'playing' and gm['turn_at']:
            gm['turn_at'] += ms


def remaining(gm, color):
    left = gm['clock'][color]
    if gm['status'] == 'playing' and gm['turn'] == color and gm['turn_at']:
        left -= now_ms() - gm['turn_at']
    return left


def can_mate(fen, color):
    """FIDE 6.9: color tomoni biror qonuniy yurishlar ketma-ketligida mat qila oladimi (qila olmasa — durang).
    Mat yoʻq: yolgʻiz shoh; shoh+ot, raqibda faqat shoh (yoki farzin); faqat fil(lar), raqibda ot/piyoda yoʻq
    va taxtadagi barcha fillar bir xil rangda. Qolgan hamma holatda mat mumkin."""
    mine, theirs, sq = [], [], set()
    for r, row in enumerate(fen.split()[0].split('/')):
        f = 0
        for ch in row:
            if ch.isdigit():
                f += int(ch)
                continue
            if ch in 'bB':
                sq.add((r + f) % 2)
            if ch not in 'kK':
                (mine if ch.isupper() == (color == 'w') else theirs).append(ch.lower())
            f += 1
    if not mine:
        return False
    if mine == ['n']:
        return any(p != 'q' for p in theirs)
    if set(mine) == {'b'}:
        return 'n' in theirs or 'p' in theirs or len(sq) > 1
    return True


REASONS = {'mate': 'mat', 'resign': 'taslim boʻldi', 'time': 'vaqt tugadi', 'stalemate': 'pat', 'repetition': 'uch marta takrorlanish',
           'fifty': '50 yurish qoidasi', 'material': 'mat qilish uchun kuch yetarli emas', 'agreement': 'kelishuv',
           'admin': 'hakam qarori'}


def finish(gm, result, reason):
    gm['status'] = 'done'
    gm['result'] = result
    gm['reason'] = reason
    gm['ended'] = now_ms()
    gm['draw_offer'] = None
    if gm['turn_at'] and gm['turn'] in ('w', 'b'):
        gm['clock'][gm['turn']] = max(0, remaining({**gm, 'status': 'playing'}, gm['turn']))
    m = S['matches'][gm['match']]
    winner = None
    if result == '1-0':
        winner = gm['white']
    elif result == '0-1':
        winner = gm['black']
    elif gm['armageddon']:
        winner = gm['black']                    # armageddon: durang — qora donalar g'alabasi
    gm['winner'] = winner
    for b in S['boards']:
        if b['game'] == gm['id']:
            b['hold_until'] = now_ms() + RESULT_HOLD * 1000
    if winner:
        set_result(m, winner)
        resolve()
    else:
        m['status'] = 'ready'                   # durang — qayta o'yin (ranglar almashadi), o'sha taxtada
        for b in S['boards']:
            if b['game'] == gm['id']:
                b['replay'] = m['id']


LAST_TICK = [0]


def tick():
    """Vaqt nazorati: soat tugagan o'yinlarni yakunlaydi; bo'sh taxtalarga navbatdagi o'yinni beradi."""
    with LOCK:
        dirty = False
        t0 = now_ms()
        gap = t0 - LAST_TICK[0] if LAST_TICK[0] else 0
        LAST_TICK[0] = t0
        if gap > 5000 or gap < 0:               # kompyuter uxlagan yoki soati oʻzgargan — bu vaqt oʻyinchilarga yozilmaydi
            pause_clocks(gap)
            dirty = True
        for gm in S['games'].values():
            if gm['status'] == 'playing' and remaining(gm, gm['turn']) <= 0:
                loser = gm['turn']
                other = 'b' if loser == 'w' else 'w'
                if not can_mate(gm['fen'], other):
                    finish(gm, '1/2-1/2', 'material')
                else:
                    finish(gm, '0-1' if loser == 'w' else '1-0', 'time')
                dirty = True
        before = [b['game'] for b in S['boards']]
        t = now_ms()
        for b in S['boards']:                    # durangdan keyin qayta o'yin — o'sha taxtada
            rid = b.get('replay')
            if rid and t >= b['hold_until'] and S['phase'] == 'running' and not S['paused']:
                m = S['matches'][rid]
                b['replay'] = None
                if m['status'] == 'ready' and b['on']:     # taxta oʻchirilgan boʻlsa — juftlik navbatga qaytadi
                    start_game(m, b)
                    dirty = True
        schedule()
        if dirty or before != [b['game'] for b in S['boards']]:
            changed()
        elif t0 - S.get('saved_at', 0) > 5000 and any(g['status'] == 'playing' for g in S['games'].values()):
            save()                              # soatlar 5 soniyada bir saqlanadi: server oʻchsa, shu joydan davom etadi


# ---------------- ekranlar uchun ma'lumot ----------------
def game_view(gm, with_moves=True):
    if not gm:
        return None
    m = S['matches'][gm['match']]
    v = {k: gm[k] for k in ('id', 'match', 'g', 'board', 'no', 'armageddon', 'fen', 'last', 'turn', 'status', 'ready',
                            'draw_offer', 'result', 'reason', 'winner', 'inc', 'white', 'black')}
    v['moves'] = gm['moves'] if with_moves else gm['moves'][-1:]
    v['ply'] = len(gm['moves'])
    v['clock'] = {'w': remaining(gm, 'w'), 'b': remaining(gm, 'b')}
    v['names'] = {'w': pname(gm['white']), 'b': pname(gm['black'])}
    v['sinf'] = {'w': S['players'].get(gm['white'], {}).get('sinf', ''), 'b': S['players'].get(gm['black'], {}).get('sinf', '')}
    v['round'] = '3-oʻrin uchun' if m['bronze'] else round_title(gm['g'], m['r'])
    v['group'] = GROUP_NAMES[gm['g']]
    v['reason_text'] = REASONS.get(gm['reason'], gm['reason'] or '')
    v['match_winner'] = m['winner']
    v['match_status'] = m['status']
    return v


def public_state():
    matches = {}
    for mid, m in S['matches'].items():
        matches[mid] = {k: m[k] for k in ('id', 'g', 'r', 's', 'p', 'winner', 'status', 'games', 'bye', 'bronze', 'note')}
        matches[mid]['title'] = '3-oʻrin uchun' if m['bronze'] else round_title(m['g'], m['r'])
    games = {gid: {k: gm[k] for k in ('id', 'match', 'g', 'board', 'no', 'white', 'black', 'status', 'result', 'reason', 'winner', 'armageddon', 'fen', 'last', 'turn')}
             for gid, gm in S['games'].items()}
    for gid, v in games.items():
        v['clock'] = {'w': remaining(S['games'][gid], 'w'), 'b': remaining(S['games'][gid], 'b')}
        v['plies'] = len(S['games'][gid]['moves'])
    boards = []
    for b in S['boards']:
        gm = S['games'].get(b['game']) if b['game'] else None
        boards.append({'id': b['id'], 'on': b['on'], 'game': game_view(gm, False) if gm else None})
    return {
        'rev': S['rev'], 'now': now_ms(), 'phase': S['phase'], 'paused': S['paused'], 'config': S['config'],
        'players': S['players'], 'matches': matches, 'rounds': S['rounds'], 'bronze': S['bronze'], 'games': games,
        'queue': [m['id'] for m in queue_order(12)],
        'boards': boards, 'standings': {g: standings(g) for g in ('B', 'G')}, 'groups': GROUP_NAMES, 'prizes': PRIZES,
        'drawn_at': S['drawn_at'], 'started_at': S['started_at'], 'finished_at': S['finished_at'], 'log': S['log'][-40:]
    }


def board_view(bid):
    b = next((x for x in S['boards'] if x['id'] == bid), None)
    if not b:
        return None
    gm = S['games'].get(b['game']) if b['game'] else None
    upcoming = []
    for m in queue_order(6):
        upcoming.append({'title': '3-oʻrin uchun' if m['bronze'] else round_title(m['g'], m['r']), 'group': GROUP_NAMES[m['g']],
                         'a': pname(m['p'][0]), 'b': pname(m['p'][1])})
    return {'rev': S['rev'], 'now': now_ms(), 'phase': S['phase'], 'paused': S['paused'], 'board': bid, 'on': b['on'],
            'game': game_view(gm), 'upcoming': upcoming[:6], 'hold_until': b['hold_until']}


# ---------------- boshqaruv (admin) ----------------
PIN_FILE = os.path.join(DATA, 'pin.txt')


def admin_pin():
    os.makedirs(DATA, exist_ok=True)
    if os.environ.get('ADMIN_PIN'):
        return os.environ['ADMIN_PIN']
    if not os.path.exists(PIN_FILE):
        with open(PIN_FILE, 'w') as f:
            f.write(str(rng.randint(1000, 9999)))
    return open(PIN_FILE).read().strip()


def resize_boards(n):
    n = max(1, min(12, int(n)))
    cur = S['boards']
    if n > len(cur):
        cur += [{'id': i + 1, 'on': True, 'game': None, 'hold_until': 0} for i in range(len(cur), n)]
    else:
        for b in cur[n:]:
            if b['game'] and S['games'][b['game']]['status'] in ('pending', 'playing'):
                raise ValueError(f"{b['id']}-taxtada oʻyin ketmoqda — avval uni yakunlang")
        del cur[n:]
    S['config']['boards'] = n


def admin_action(act, body):
    ph = S['phase']
    if act == 'players':
        if ph != 'setup' and ph != 'drawn':
            raise ValueError('Turnir boshlangan — roʻyxatni oʻzgartirib boʻlmaydi')
        lists = {g: [{'name': x.split('|')[0].strip(), 'sinf': (x.split('|')[1].strip() if '|' in x else '')}
                     for x in body.get(g, '').splitlines() if x.strip()] for g in ('B', 'G')}
        S['players'] = make_players(lists)
        S['matches'], S['rounds'], S['bronze'], S['games'] = {}, {'B': [], 'G': []}, {}, {}
        S['phase'] = 'setup'
        return 'Roʻyxat saqlandi'
    if act == 'config':
        new = {k: min(90, int(body[k])) for k in ('tc_min', 'tc_inc', 'arm_w', 'arm_b') if k in body}
        if min(new.get('tc_min', 1), new.get('arm_w', 1), new.get('arm_b', 1)) < 1 or new.get('tc_inc', 0) < 0:
            raise ValueError('Vaqt notoʻgʻri: kamida 1 daqiqa boʻlishi kerak (qoʻshimcha soniya 0 boʻlishi mumkin)')
        if 'boards' in body:
            resize_boards(body['boards'])       # rad etilsa, boshqa sozlamalar ham oʻzgarmaydi
        S['config'].update(new)
        return 'Sozlamalar saqlandi'
    if act == 'draw':
        if ph not in ('setup', 'drawn'):
            raise ValueError('Turnir boshlangan — qayta qur’a tashlab boʻlmaydi')
        S['matches'], S['rounds'], S['bronze'], S['games'] = {}, {'B': [], 'G': []}, {}, {}
        for g in ('B', 'G'):
            build_bracket(g)
        S['phase'] = 'drawn'
        S['drawn_at'] = now_ms()
        resolve()
        return 'Qur’a tashlandi'
    if act == 'start':
        if ph != 'drawn':
            raise ValueError('Avval qur’a tashlang')
        S['phase'] = 'running'
        S['started_at'] = now_ms()
        resolve()
        schedule()
        return 'Turnir boshlandi'
    if act == 'pause':
        S['paused'] = bool(body.get('on'))
        return 'Pauza' if S['paused'] else 'Davom etmoqda'
    if act == 'board':
        b = next(x for x in S['boards'] if x['id'] == int(body['id']))
        b['on'] = bool(body.get('on'))
        return f"{b['id']}-taxta {'yoqildi' if b['on'] else 'oʻchirildi'}"
    if act == 'force_start':
        gm = S['games'][body['game']]
        if gm['status'] == 'pending':
            begin(gm)
        return 'Oʻyin boshlandi'
    if act == 'abort':                              # o'yinni bekor qilish — juftlik qaytadan o'ynaydi
        gm = S['games'][body['game']]
        if gm['status'] not in ('pending', 'playing'):
            raise ValueError('Bu oʻyin allaqachon tugagan')
        gm['status'] = 'aborted'
        gm['ended'] = now_ms()
        m = S['matches'][gm['match']]
        m['games'].remove(gm['id'])
        m['status'] = 'ready'
        for b in S['boards']:
            if b['game'] == gm['id']:
                b['game'] = None
                if b['on']:
                    start_game(m, b, white=gm['white'])     # oʻsha taxtada, oʻsha ranglar bilan
        return 'Oʻyin bekor qilindi — juftlik qayta oʻynaydi'
    if act == 'winner':                             # hakam qarori (kelmadi, texnik nosozlik va h.k.)
        m = S['matches'][body['match']]
        w = body['player']
        if not w or w not in m['p']:
            raise ValueError('Bu oʻquvchi juftlikda yoʻq')
        if m['status'] in ('done', 'bye'):
            raise ValueError('Juftlik natijasi allaqachon bor')
        if not (m['p'][0] and m['p'][1]):
            raise ValueError('Juftlikda hali ikkala oʻquvchi yoʻq')
        for gid in m['games']:
            gm = S['games'][gid]
            if gm['status'] in ('pending', 'playing'):
                if gm['status'] == 'playing':
                    gm['clock'][gm['turn']] = max(0, remaining(gm, gm['turn']))
                gm['draw_offer'] = None
                gm['status'] = 'done'
                gm['result'] = '1-0' if gm['white'] == w else '0-1'
                gm['reason'] = 'admin'
                gm['winner'] = w
                gm['ended'] = now_ms()
                for b in S['boards']:
                    if b['game'] == gid:
                        b['hold_until'] = now_ms() + RESULT_HOLD * 1000
        set_result(m, w, 'hakam qarori')
        resolve()
        return f'Gʻolib: {pname(w)}'
    if act == 'reset':
        if body.get('confirm') != 'TOZALASH':
            raise ValueError('Tasdiqlash soʻzi notoʻgʻri')
        if os.path.exists(STATE_FILE):
            shutil.copy(STATE_FILE, os.path.join(DATA, f'turnir-zaxira-{int(time.time())}.json'))
        keep = S['players'], S['config']
        S.clear()
        S.update(new_state())
        S['players'], S['config'] = keep
        S['boards'] = [{'id': i + 1, 'on': True, 'game': None, 'hold_until': 0} for i in range(S['config']['boards'])]
        return 'Turnir tozalandi (zaxira nusxa saqlandi)'
    raise ValueError('Nomaʼlum buyruq')


# ---------------- o'yinchi harakatlari ----------------
def player_action(gid, act, body):
    gm = S['games'].get(gid)
    if not gm:
        raise ValueError('Oʻyin topilmadi')
    color = body.get('color')
    if color not in ('w', 'b'):
        raise ValueError('Rang notoʻgʻri')
    if act == 'ready':
        if gm['status'] == 'pending':
            gm['ready'][color] = True
            if gm['ready']['w'] and gm['ready']['b']:
                begin(gm)
        return
    if gm['status'] != 'playing':
        raise ValueError('Oʻyin davom etmayapti')
    if remaining(gm, gm['turn']) <= 0:          # bayroq tushgan, ticker hali ulgurmagan — avval vaqt natijasi
        tick()
        raise ValueError('Vaqt tugagan')
    if act == 'move':
        if gm['turn'] != color:
            raise ValueError('Hozir sizning navbatingiz emas')
        if int(body.get('ply', -1)) != len(gm['moves']):
            raise ValueError('Yurish tartibi mos emas — sahifa yangilanadi')
        left = remaining(gm, color)
        san, fen = str(body['san'])[:12], str(body['fen'])[:100]
        over = body.get('over') or None
        if over is not None:                    # oʻyin tugashi faqat yuruvchi tomon uchun va sababga mos natija bilan
            why = over.get('reason') if isinstance(over, dict) else None
            need = {'mate': '1-0' if color == 'w' else '0-1', 'stalemate': '1/2-1/2', 'repetition': '1/2-1/2',
                    'fifty': '1/2-1/2', 'material': '1/2-1/2'}
            if why not in need or over.get('result') != need[why] or (why == 'mate') != san.endswith('#'):
                raise ValueError('Oʻyin natijasi notoʻgʻri — sahifa yangilanadi')
        gm['clock'][color] = left + gm['inc']
        gm['moves'].append(san)
        gm['fen'] = fen
        gm['last'] = [str(body.get('from', ''))[:2], str(body.get('to', ''))[:2]]
        gm['turn'] = 'b' if color == 'w' else 'w'
        gm['turn_at'] = now_ms()
        if gm['draw_offer'] and gm['draw_offer'] != color:
            gm['draw_offer'] = None             # raqib taklifiga javoban yurish — rad etilgan hisoblanadi
        if over is not None:
            finish(gm, over['result'], why)
        return
    if act == 'resign':
        finish(gm, '0-1' if color == 'w' else '1-0', 'resign')
        return
    if act == 'draw':
        a = body.get('action')
        other = 'b' if color == 'w' else 'w'
        if a == 'offer':
            if gm['draw_offer'] == other:
                finish(gm, '1/2-1/2', 'agreement')      # ikkala tomon ham durang taklif qildi — kelishuv
                return
            if gm.setdefault('offered', {}).get(color) == len(gm['moves']):
                raise ValueError('Durangni har yurishda bir marta taklif qilish mumkin')
            gm['offered'][color] = len(gm['moves'])
            gm['draw_offer'] = color
        elif a == 'accept' and gm['draw_offer'] == other:
            finish(gm, '1/2-1/2', 'agreement')
        elif a == 'decline' and gm['draw_offer'] == other:
            gm['draw_offer'] = None
        return
    raise ValueError('Nomaʼlum harakat')


# ---------------- natijalar (CSV) ----------------
def export_csv():
    out = io.StringIO()
    w = csv.writer(out)
    w.writerow(['Guruh', 'Bosqich', 'Taxta', 'Oq', 'Qora', 'Natija', 'Sabab', 'Yurishlar'])
    for gm in sorted(S['games'].values(), key=lambda x: x['created']):
        if gm['status'] == 'aborted':
            continue
        m = S['matches'][gm['match']]
        w.writerow([GROUP_NAMES[gm['g']], '3-oʻrin uchun' if m['bronze'] else round_title(gm['g'], m['r']), gm['board'],
                    pname(gm['white']), pname(gm['black']), gm['result'] or '', REASONS.get(gm['reason'], ''), ' '.join(gm['moves'])])
    w.writerow([])
    for g in ('B', 'G'):
        for s in standings(g):
            w.writerow([GROUP_NAMES[g], f"{s['place']}-oʻrin", '', s['name'], '', f"{s['prize']:,} soʻm".replace(',', ' ')])
    return '﻿' + out.getvalue()


# ---------------- HTTP ----------------
mimetypes.add_type('text/javascript', '.js')
mimetypes.add_type('text/css', '.css')
mimetypes.add_type('font/ttf', '.ttf')
PAGES = {'/': 'index.html', '/admin': 'admin.html', '/taxta': 'taxta.html'}


class H(BaseHTTPRequestHandler):
    server_version = 'MirzoUlugbekShaxmat/1.0'

    def log_message(self, fmt, *args):
        pass

    def send_json(self, obj, code=200):
        data = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def body(self):
        n = int(self.headers.get('Content-Length') or 0)
        return json.loads(self.rfile.read(n) or b'{}') if n else {}

    def wait_rev(self, q):
        """Uzun so'rov: rev o'zgarguncha (yoki 15 s) kutadi — ekranlar darhol yangilanadi."""
        try:
            rev = int(q.get('rev', ['0'])[0])
        except ValueError:
            rev = 0
        with COND:
            if rev and rev == S['rev']:
                COND.wait(timeout=15)

    def do_GET(self):
        u = urlparse(self.path)
        q = parse_qs(u.query)
        p = u.path.rstrip('/') or '/'
        if p == '/api/state':
            self.wait_rev(q)
            with LOCK:
                return self.send_json(public_state())
        m = re.fullmatch(r'/api/taxta/(\d+)', p)
        if m:
            self.wait_rev(q)
            with LOCK:
                v = board_view(int(m.group(1)))
            return self.send_json(v or {'error': 'Taxta topilmadi'}, 200 if v else 404)
        if p == '/api/natijalar.csv':
            with LOCK:
                data = export_csv().encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/csv; charset=utf-8')
            self.send_header('Content-Disposition', 'attachment; filename="shaxmat-natijalar.csv"')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            return self.wfile.write(data)
        if p == '/api/admin/check':
            ok = self.headers.get('X-Pin') == admin_pin()
            return self.send_json({'ok': ok, 'lan': [f'http://{ip}:{PORT}' for ip in lan_ips()] if ok else []})
        if re.fullmatch(r'/taxta/\d+(/(oq|qora))?', p):
            p = '/taxta'
        fn = PAGES.get(p, p.lstrip('/'))
        path = os.path.normpath(os.path.join(STATIC, fn))
        if not path.startswith(STATIC) or not os.path.isfile(path):
            self.send_error(404)
            return
        with open(path, 'rb') as f:
            data = f.read()
        self.send_response(200)
        self.send_header('Content-Type', (mimetypes.guess_type(path)[0] or 'application/octet-stream') + ('; charset=utf-8' if path.endswith(('.html', '.js', '.css')) else ''))
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        u = urlparse(self.path)
        p = u.path.rstrip('/')
        try:
            body = self.body()
        except (ValueError, json.JSONDecodeError):
            return self.send_json({'error': 'Soʻrov notoʻgʻri'}, 400)
        m = re.fullmatch(r'/api/admin/(\w+)', p)
        if m:
            if self.headers.get('X-Pin') != admin_pin():
                return self.send_json({'error': 'PIN notoʻgʻri'}, 403)
            with LOCK:
                try:
                    msg = admin_action(m.group(1), body)
                except (ValueError, KeyError, StopIteration) as e:
                    return self.send_json({'error': str(e) or 'Xato'}, 400)
                except TypeError:                       # formadan boʻsh/NaN qiymat (null) keldi
                    return self.send_json({'error': 'Maʼlumot notoʻgʻri'}, 400)
                changed(msg)
            return self.send_json({'ok': True, 'message': msg})
        m = re.fullmatch(r'/api/game/([\w-]+)/(\w+)', p)
        if m:
            with LOCK:
                try:
                    player_action(m.group(1), m.group(2), body)
                except (ValueError, KeyError) as e:
                    return self.send_json({'error': str(e) or 'Xato'}, 409)
                except TypeError:
                    return self.send_json({'error': 'Maʼlumot notoʻgʻri'}, 409)
                changed()
                tick()
            return self.send_json({'ok': True})
        self.send_json({'error': 'Topilmadi'}, 404)


def lan_ips():
    ips = set()
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('10.255.255.255', 1))
        ips.add(s.getsockname()[0])
        s.close()
    except OSError:
        pass
    try:
        for info in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            ips.add(info[4][0])
    except OSError:
        pass
    return sorted(ip for ip in ips if not ip.startswith('127.')) or ['127.0.0.1']


def ticker():
    while True:
        time.sleep(0.25)
        try:
            tick()
        except Exception as e:                      # ticker hech qachon to'xtamasin
            print('tick xatosi:', e, file=sys.stderr)


def main():
    for stream in (sys.stdout, sys.stderr):          # Windows konsolida oʻzbekcha harflar xato bermasin
        try:
            stream.reconfigure(errors='replace')
        except Exception:
            pass
    load()
    pin = admin_pin()
    try:
        srv = ThreadingHTTPServer(('0.0.0.0', PORT), H)
    except OSError as e:
        print(f'{PORT}-port band yoki ochilmadi ({e}). Server allaqachon ishlayotgan boʻlishi mumkin — oynalarni tekshiring.')
        print('Boshqa port bilan: set PORT=8080  va qayta ishga tushiring.')
        sys.exit(1)
    threading.Thread(target=ticker, daemon=True).start()
    srv.daemon_threads = True
    ip = lan_ips()[0]
    np = {g: sum(1 for p in S['players'].values() if p['g'] == g) for g in ('B', 'G')}
    print('=' * 64)
    print(' «Mirzo Ulugʻbek» xususiy maktabi — SHAXMAT TURNIRI')
    print('=' * 64)
    print(f" Oʻquvchilar: oʻgʻil bolalar {np['B']} ta, qizlar {np['G']} ta   (holat: {S['phase']})")
    print(f' Katta ekran (proyektor):  http://{ip}:{PORT}/')
    print(f' Boshqaruv (hakam):        http://{ip}:{PORT}/admin      PIN: {pin}')
    for b in S['boards']:
        print(f" {b['id']}-taxta:  OQ  http://{ip}:{PORT}/taxta/{b['id']}/oq    QORA  http://{ip}:{PORT}/taxta/{b['id']}/qora")
    print(' Toʻxtatish: Ctrl+C.  Holat har yurishda data/turnir.json ga saqlanadi.')
    print('=' * 64)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print('\nServer toʻxtatildi.')


if __name__ == '__main__':
    main()
