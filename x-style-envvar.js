(() => {
  /**
   * x-style plugin for environment variables in the css.
   * To define an environment variable, set xstyle.env to an object with:
   *  xstyle.env = { "--my-var": "red" };
   * To use an environment variable, use the env() function in the css:
   *  <div x-style="color: env(--my-var, blue);"></div>
   */

  var xstyle = window.xstyle;

  var doEnvVars = (css) => {
    var env = xstyle.env;
    var bits = [...css.split(/\senv\((--[^),]+)/g)];
    var end, variable, fallback;
    while (bits.length > 1) {
      end = bits.pop();
      variable = bits.pop().trim();
      fallback;
      if (end[0] === ")") {
        end = end.slice(1);
      } else if (end[0] === ",") {
        [fallback, end] = end.split(")", 2);
      }
      if (env[variable] !== undefined) {
        bits[bits.length - 1] += ` ${env[variable]}${end}`;
      } else if (fallback) {
        bits[bits.length - 1] += ` ${fallback.slice(1).trim()}${end}`;
      } else {
        bits[bits.length - 1] += ` ${end}`;
      }
    }
    return bits[0]
  }
  
  xstyle.env = xstyle.env || {};
  xstyle.pre.push(doEnvVars);
})();