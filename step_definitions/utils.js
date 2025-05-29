import nunjucks from "nunjucks";

export function convert(value, type) {
    if (type === 'boolean') {
        return value === 'true';
    }
    if (type === 'integer') {
        return parseInt(value, 10);
    }
    if (type === 'float') {
        return parseFloat(value);
    }
    if (type === 'json') {
        return JSON.parse(value);
    }

    return value;
}

export function render(template, context) {
    return nunjucks.renderString(template, context);
}

export function getDataTable(context, dataTable) {
    const result = {};

    dataTable.rawTable
        .slice(1)
        .forEach((entry) => {
            const key = render(entry[0], context);
            const value = render(entry[1], context);
            const type = entry[2] || 'string';

            result[key] = convert(value, type);
        });

    return result;
}