export const tokenize = (input: string): string[] => {
  const tokens: string[] = [];
  let begin = 0;
  let end = 0;

  const flush = () => {
    if (end - begin > 0) {
      tokens.push(input.substring(begin, end));
    }
  };

  for (let i = 0; i < input.length; ) {
    if (/\s/.test(input[i])) {
      flush();
      begin = end = ++i;
    } else if (input[i] === '{') {
      let counter = 1;

      flush();
      begin = end = i++;
      for (;;) {
        if (i >= input.length) {
          throw new Error('Unterminated JSON object');
        }
        ++end;
        ++i;
        if (input[i - 1] === '{') {
          ++counter;
        } else if (input[i - 1] === '}') {
          ++end;
          if (--counter === 0) {
            break;
          }
        }
      }
    } else {
      ++end;
      ++i;
    }
  }
  flush();

  return tokens;
};
