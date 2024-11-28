export declare class Filter {
    private config?;
    private readonly foo;
    private readonly replacements;
    private readonly cleanWith;
    private minFiltered;
    /**
     * Constructs filter
     * @param {Object} config options for the filter
     * @param {String[]} config.list filter list pulled in from default list or custom
     * @param {Array<String | RegExp>} config.filter filter used in all functions
     * @param {number} config.minFiltered minimum length string in filter (any other shorter word will be ignored)
     * @param {String} config.cleanWith a character to replace bad words with [default: '*']
     * @param {number} config.strictness 0: high, 1: medium, 2:low [default: 1]
     * @param {boolean} config.useRegex true for enabling regex filtering, false for exact dictionary match *WARNING: large amounts of regex is much slower* [defailt: false]
     */
    constructor(config?: {
        list?: string[];
        filter?: Set<string | RegExp>;
        minFiltered?: number;
        cleanWith?: string;
        strictness?: number;
        useRegex?: boolean;
    } | undefined);
    /**
     * converts to lowercase, replaces accented characters, replaces common symbol/l33t text, removes non-alphabetical characters
     * @param {String} str string to normalize
     * @returns {String} cleaned string
     */
    normalize(str: string): string;
    /**
     * censors filtered words
     * @param {String} string message to censor filter words
     * @returns {String} cleaned up message with filter words censored by cleanWith string
     */
    clean(string: string): string;
    /**
     * gets all the combos for every word of a string
     * @param {String} str string to get possible cases of
     * @returns {String[][]} all possible combinations for each word
     */
    private getAllCombos;
    /**
     * console.logs function calls with given string
     * @param {String} str string to run tests on
     */
    debug(str: string): void;
    /**
     * gets all the indexes of words that are filtered
     * @param {String} str message to check
     * @returns {number[]} indexes of filtered words, empty if none detected
     */
    getUncleanWordIndexes(str: string): number[];
    /**
     * checks if a string has any filtered words
     * @param {String} str message to test
     * @returns {boolean} true if contains filtered words
     */
    isUnclean(str: string): boolean;
    /**
     * Checks if a word is filtered or not
     * @param {String} word word to check
     * @returns {boolean} returns true if is filtered word
     */
    isWordUnclean(word: string): boolean;
}
//# sourceMappingURL=index.d.ts.map