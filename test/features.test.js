const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {listFeatures} = require('../lib/features');

function createDirectoryWith(files) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'features-'));

    files.forEach((file) => {
        fs.mkdirSync(path.dirname(path.join(dir, file)), {recursive: true});
        fs.writeFileSync(path.join(dir, file), '');
    });

    return dir;
}

test('lists feature files sorted by path whatever their creation order', () => {
    const dir = createDirectoryWith([
        'front/zeta.feature',
        'api/users.feature',
        'front/alpha.feature',
        'root.feature',
        'api/groups.feature',
    ]);

    assert.deepEqual(listFeatures(dir), [
        'api/groups.feature',
        'api/users.feature',
        'front/alpha.feature',
        'front/zeta.feature',
        'root.feature',
    ].map((file) => path.join(dir, file)));
});

test('sorts by code unit order, independently of the locale', () => {
    const dir = createDirectoryWith(['b.feature', 'B.feature', 'a.feature', '10.feature', '2.feature']);

    assert.deepEqual(
        listFeatures(dir).map((file) => path.basename(file)),
        ['10.feature', '2.feature', 'B.feature', 'a.feature', 'b.feature'],
    );
});

test('ignores files that are not feature files', () => {
    const dir = createDirectoryWith(['login.feature', 'README.md', 'nested/notes.txt', 'nested/feature']);

    assert.deepEqual(listFeatures(dir), [path.join(dir, 'login.feature')]);
});

test('returns an empty list when the directory holds no feature file', () => {
    assert.deepEqual(listFeatures(createDirectoryWith(['README.md'])), []);
});

test('throws when the directory does not exist', () => {
    assert.throws(() => listFeatures(path.join(os.tmpdir(), 'missing-features')), {code: 'ENOENT'});
});
