const url = require('url');
const _ = require('lodash');
const testUtils = require('../../../../utils');
const schema = require('../../../../../server/data/schema').tables;
const API_URL = '/ghost/api/v2/content/';

const expectedProperties = {
    // API top level
    posts: ['posts', 'meta'],
    tags: ['tags', 'meta'],
    authors: ['authors', 'meta'],
    pagination: ['page', 'limit', 'pages', 'total', 'next', 'prev'],

    post: _(schema.posts)
        .keys()
        // by default we only return html
        .without('mobiledoc', 'plaintext')
        // v2 doesn't return author_id OR author
        .without('author_id', 'author')
        // and always returns computed properties: url, primary_tag, primary_author
        .concat('url', 'primary_tag', 'primary_author')
        // v2 API doesn't return unused fields
        .without('locale')
        // These fields aren't useful as they always have known values
        .without('page', 'status')
    ,
    author: _(schema.users)
        .keys()
        .without(
            'password',
            'email',
            'ghost_auth_access_token',
            'ghost_auth_id',
            'created_at',
            'created_by',
            'updated_at',
            'updated_by',
            'last_seen',
            'status'
        )
        // v2 API doesn't return unused fields
        .without('accessibility', 'locale', 'tour')
    ,
    tag: _(schema.tags)
        .keys()
        // v2 Tag API doesn't return parent_id or parent
        .without('parent_id', 'parent')
        // v2 Tag API doesn't return date fields
        .without('created_at', 'updated_at')
};

_.each(expectedProperties, (value, key) => {
    if (!value.__wrapped__) {
        return;
    }

    /**
     * @deprecated: x_by
     */
    expectedProperties[key] = value
        .without(
            'created_by',
            'updated_by',
            'published_by'
        )
        .value();
});

module.exports = {
    API: {
        getApiQuery(route) {
            return url.resolve(API_URL, route);
        },

        checkResponse(...args) {
            this.expectedProperties = expectedProperties;
            return testUtils.API.checkResponse.call(this, ...args);
        }
    },
    getValidKey() {
        return _.repeat('c', 128);
    }
};
