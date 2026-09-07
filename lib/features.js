const fs = require('fs');
const path = require('path');

/**
 * List every `.feature` file under `dir` (recursively) as absolute paths.
 *
 * The list is sorted by code unit order (`Array.prototype.sort` without a comparator), which does
 * not depend on the locale nor on the order the filesystem returns entries, so the same set of files
 * always yields the same list on every machine.
 *
 * @param {string} dir - Directory holding the feature files.
 * @returns {string[]} Sorted absolute paths of the feature files.
 */
function listFeatures(dir) {
    return fs.readdirSync(dir, {recursive: true, withFileTypes: true})
        .filter((entry) => entry.isFile() && entry.name.endsWith('.feature'))
        .map((entry) => path.join(entry.parentPath, entry.name))
        .sort();
}

module.exports = {listFeatures};
