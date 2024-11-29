import filtersets from '../filtersets/en.json' with { type: 'json' };


interface IFoo1 {
  useRegex: true;
  filter: Set<RegExp>;
}



interface IFoo2 {
  useRegex: false;
  filter: Set<string>;
}



type Foo = IFoo1 | IFoo2;



export class Filter {
  private readonly foo: Partial<Foo> = {};
  // private readonly useRegex: boolean;
  // private readonly filter: Set<string> | Set<RegExp>;
  private readonly replacements: Map<RegExp, string>;
  private readonly cleanWith: string;
  private minFiltered: number;


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
  constructor(private config?: {
    list?: string[];
    filter?: Set<string | RegExp>;
    minFiltered?: number;
    cleanWith?: string;
    strictness?: number;
    useRegex?: boolean
  }) {
    let list: string[] | undefined = config ? config.list : undefined;
    if (!list) {
      console.error(JSON.stringify(filtersets.filter));
      list = filtersets.filter;
    } //use default list
    this.foo.useRegex = config?.useRegex ?? false;
    if (this.foo.useRegex) {
      this.foo.filter = new Set(
          list?.map((r: string): RegExp => {
            return new RegExp(r, 'g');
          }) ?? []
      );
    } else {
      this.foo.filter = new Set(list);
    }

    this.config = {};
    this.cleanWith = config?.cleanWith ? config.cleanWith : '*';
    this.minFiltered = this.foo.useRegex ? 0 : ((this.foo.filter as Set<string> | undefined)?.values()
        ?.next()?.value?.length ?? 0); //ADD DEFAULT VALUE FOR DEFAULT LIST
    if (!this.foo.useRegex) {
      (this.foo.filter as Set<string>).forEach((e: string): void => {
        if (e.length < this.minFiltered) {
          this.minFiltered = e.length;
        }
      });
    }

    //this.strictness = config && config.strictness; for the future
    this.replacements = new Map([
      [ /!/g, 'i' ],
      [ /@/g, 'a' ],
      [ /\$/g, 's' ],
      [ /3/g, 'e' ],
      [ /8/g, 'b' ],
      [ /1/g, 'i' ],
      [ /¡/g, 'i' ],
      [ /5/g, 's' ],
      [ /0/g, 'o' ],
      [ /4/g, 'h' ],
      [ /7/g, 't' ],
      [ /9/g, 'g' ],
      [ /6/g, 'b' ],
      [ /8/g, 'b' ],
    ]);
  }


  /**
   * converts to lowercase, replaces accented characters, replaces common symbol/l33t text, removes non-alphabetical characters
   * @param {String} str string to normalize
   * @returns {String} cleaned string
   */
  public normalize(str: string): string {
    str = str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); //replaces accented characters
    this.replacements.forEach((replWith: string, targ: RegExp): string => (str = str.replace(targ, replWith)));
    return str
        .replace(/ +(?= )/g, '') // replace any where where there are more than 2 consecutive spaces
        .replace(/[^a-zA-Z\s]/g, ''); // removes non-alphabetical characters
  }


  /**
   * censors filtered words
   * @param {String} string message to censor filter words
   * @returns {String} cleaned up message with filter words censored by cleanWith string
   */
  public clean(string: string): string {
    let censorIndexes: Set<number> = new Set(this.getUncleanWordIndexes(string));
    return string
        .split(/ +/g)
        .map((w: string, i: number): string => {
          if (censorIndexes.has(i)) {
            let cleanString: string = '';
            if (Array.isArray(this.cleanWith)) {
              for (let i: number = 0; i < w.length; i++) {
                cleanString += this.cleanWith[Math.floor(Math.random() * this.cleanWith.length)];
              }
            } else {
              cleanString = this.cleanWith.repeat(w.length);
            }
            return cleanString;
          }
          return w;
        })
        .join(' ');
  }


  /**
   * gets all the combos for every word of a string
   * @param {String} str string to get possible cases of
   * @returns {String[][]} all possible combinations for each word
   */
  private getAllCombos(str: string): string[][] {
    return str.split(' ').map((w: string): string[] => {
      if (/(.)\1{1,}/.test(w) && w.length > this.minFiltered)
          //only tests those with at least one double char
        return allPossibleCases(combos(w));
      return [ w ];
    });
  }


  /**
   * console.logs function calls with given string
   * @param {String} str string to run tests on
   */
  public debug(str: string): void {
    console.log(`Normalized:\n\t${ this.normalize(str) }`);
    console.log(`isUnclean:\n\t${ this.isUnclean(str) }`);
    console.log(`uncleanWordIndexes:\n\t${ this.getUncleanWordIndexes(str) }`);
    console.log(`cleaned:\n\t${ this.clean(str) }`);
    console.log(`getCombos:\n\t${ this.getAllCombos(str) }`);
  }


  /**
   * gets all the indexes of words that are filtered
   * @param {String} str message to check
   * @returns {number[]} indexes of filtered words, empty if none detected
   */
  public getUncleanWordIndexes(str: string): number[] {
    str = this.normalize(str);
    let uncleanIndexes: number[] = [];
    let arr: string[][] = this.getAllCombos(str);
    for (let i: number = 0; i < arr.length; i++) {
      for (let j: number = 0; j < arr[i].length; j++) {
        if (this.isWordUnclean(arr[i][j])) {
          uncleanIndexes.push(i);
        }
      }
    }
    return uncleanIndexes;
  }


  /**
   * checks if a string has any filtered words
   * @param {String} str message to test
   * @returns {boolean} true if contains filtered words
   */
  public isUnclean(str: string): boolean {
    let arr: string[][] = this.getAllCombos(this.normalize(str));
    for (let i: number = 0; i < arr.length; i++) {
      for (let j: number = 0; j < arr[i].length; j++) {
        if (this.isWordUnclean(arr[i][j])) {
          return true;
        }
      }
    }

    return false;
  }


  /**
   * Checks if a word is filtered or not
   * @param {String} word word to check
   * @returns {boolean} returns true if is filtered word
   */
  public isWordUnclean(word: string): boolean {
    if (this.foo.useRegex) {
      let detected: boolean = false;
      this.foo.filter?.forEach((r: RegExp): void => {
        if (r.test(word)) detected = true;
      });
      return detected;
    } else {
      return (this.foo?.filter as Set<string> | undefined)?.has(word) ?? false;
    }
  }
}



/**
 * gets all possible cases for sentence
 * @param {String[][]} arr containing words of the sentence
 * @returns {String[]} flattened array containing all the possible combinations
 */
function allPossibleCases(arr: string[][]): string[] {
  if (arr.length == 1) {
    return arr[0];
  } else {
    const result: string[] = [];
    const allCasesOfRest: string[] = allPossibleCases(arr.slice(1)); // recur with the rest of array
    for (let i: number = 0; i < allCasesOfRest.length; i++) {
      for (let j: number = 0; j < arr[0].length; j++) {
        result.push(arr[0][j] + allCasesOfRest[i]);
      }
    }
    return result;
  }
}


/**
 * gets all the combos for a single word
 * @param {String} word word to get combos of
 * @returns {String[][]} possible combination for given word
 */
function combos(word: string): string[][] {
  let val: string[] = [];
  let chop: string = word[0];
  for (let i: number = 1; i <= word.length; i++) {
    if (chop[0] == word[i]) {
      chop += word[i];
    } else {
      val.push(chop);
      chop = word[i];
    }
  }
  //return arr;
  let arr: string[][] = [];
  for (let i: number = 0; i < val.length; i++) {
    const temp: string[] = [];
    if (val[i].length >= 2) {
      temp.push(val[i][0].repeat(2));
    }
    temp.push(val[i][0]);
    arr.push(temp);
  }
  return arr;
}
