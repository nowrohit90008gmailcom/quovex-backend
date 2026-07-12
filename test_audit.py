"""Full audit test for all admin endpoints."""
import requests
import json

BASE = 'http://localhost:8000/api/v1'

r = requests.post(BASE + '/auth/admin-login', json={'email': 'admin@quovex.online', 'password': 'dev'})
if r.status_code != 200:
    print('LOGIN FAILED:', r.text[:200])
    exit(1)
token = r.json()['access_token']
headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

tests = [
    ('OVERVIEW',           'GET', '/admin/overview'),
    ('USERS',              'GET', '/admin/users?limit=3'),
    ('STUDENTS',           'GET', '/admin/students?limit=3'),
    ('CLASS DIST',         'GET', '/admin/students/class-distribution'),
    ('ANTI-CHEAT',         'GET', '/admin/anti-cheat'),
    ('QUIZ',               'GET', '/admin/quiz'),
    ('LEADERBOARDS',       'GET', '/admin/leaderboards?track=study&period=week'),
    ('FREEZE STATUS',      'GET', '/admin/leaderboards/freeze-status'),
    ('REWARDS',            'GET', '/admin/rewards'),
    ('REWARDS SUMMARY',    'GET', '/admin/rewards/summary'),
    ('EXAM TAGS',          'GET', '/admin/exam-tags'),
    ('OTP LOGS',           'GET', '/admin/otp-logs'),
    ('NOTIF HISTORY',      'GET', '/admin/notifications/history'),
    ('ROLES',              'GET', '/admin/roles'),
    ('SETTINGS',           'GET', '/admin/settings'),
    ('ANALYTICS OVERVIEW', 'GET', '/admin/analytics/overview'),
    ('ANALYTICS DAU',      'GET', '/admin/analytics/dau'),
    ('ANALYTICS REVENUE',  'GET', '/admin/analytics/revenue'),
    ('GEO',                'GET', '/admin/analytics/geo'),
    ('DIVERGENCE',         'GET', '/admin/analytics/divergence'),
]

all_ok = True
for name, method, path in tests:
    r = requests.get(BASE + path, headers=headers)
    ok = r.status_code == 200
    if not ok:
        all_ok = False
    detail = ''
    if ok:
        data = r.json()
        if isinstance(data, list):
            detail = ' | {} items'.format(len(data))
            if data and isinstance(data[0], dict):
                detail += ' | keys: {}'.format(list(data[0].keys())[:8])
        elif isinstance(data, dict):
            detail = ' | keys: {}'.format(list(data.keys())[:8])
    else:
        detail = ' | {}'.format(r.text[:100])
    status = 'OK' if ok else 'FAIL'
    print('{:4} {:20} {} {}'.format(status, name, r.status_code, detail))

# Specific schema checks
print()
r = requests.get(BASE + '/admin/otp-logs', headers=headers)
if r.status_code == 200:
    d = r.json()['data']
    if d:
        print('OTP log first item keys:', list(d[0].keys()))
        print('OTP status value:', d[0].get('status'))

r = requests.get(BASE + '/admin/notifications/history', headers=headers)
if r.status_code == 200:
    d = r.json()
    if isinstance(d, list) and len(d) > 0:
        print('Notif history first item keys:', list(d[0].keys()))
    elif isinstance(d, list):
        print('Notif history: empty list (correct format)')
    else:
        print('Notif history: unexpected type', type(d))

r = requests.get(BASE + '/admin/analytics/divergence', headers=headers)
if r.status_code == 200:
    d = r.json()
    print('Divergence keys:', list(d.keys()))
    print('Divergence daily_trend length:', len(d.get('daily_trend', [])))
    if d.get('daily_trend'):
        print('Divergence first day:', d['daily_trend'][0])

print()
print('All 20 endpoints OK:', all_ok)
