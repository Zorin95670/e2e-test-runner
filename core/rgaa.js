// Only the axe-core rules mapped to RGAA 4 criteria are run.
export const AXE_OPTIONS = {
    runOnly: { type: 'tag', values: ['RGAAv4'] },
};

const IMPACTS = ['minor', 'moderate', 'serious', 'critical'];

export function violationsAbove(violations, impact) {
    const level = IMPACTS.indexOf(impact);

    if (level === -1) {
        throw new Error(`Unknown impact "${impact}". Available impacts: ${IMPACTS.join(', ')}`);
    }

    return violations.filter((violation) => IMPACTS.indexOf(violation.impact) > level);
}

export function formatViolations(violations) {
    return violations
        .map(({ id, impact, help, nodes }) => `[${impact}] ${id}: ${help} (${nodes.map(({ target }) => target.join(' ')).join(', ')})`)
        .join('\n');
}
