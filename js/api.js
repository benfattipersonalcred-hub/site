const API_CLIENT = Object.freeze({
    post(endpoint, payload, options = {}) {
        const { mode = 'cors', headers = {}, ...requestOptions } = options;

        return fetch(endpoint, {
            method: 'POST',
            mode,
            headers: {
                // Use text/plain to avoid JSON content-type preflight on Google Apps Script endpoints.
                'Content-Type': 'text/plain;charset=utf-8',
                ...headers
            },
            body: JSON.stringify(payload),
            ...requestOptions
        });
    }
});
