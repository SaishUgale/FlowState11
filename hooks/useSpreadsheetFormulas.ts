import { useCallback } from "react";

export const useSpreadsheetFormulas = () => {
  const evaluateFormula = useCallback((formula: string, getCellValue: (row: number, col: number) => number) => {
    if (!formula || !formula.startsWith("=")) return formula;
    
    try {
      let expr = formula.substring(1).toUpperCase();
      
      // Range Parser Helper
      const parseRange = (rangeStr: string) => {
        const [start, end] = rangeStr.split(':');
        const parseCell = (cell: string) => {
          const match = cell.match(/([A-Z]+)(\d+)/);
          if (!match) return { row: 0, col: 0 };
          const colStr = match[1];
          const rowStr = match[2];
          let col = 0;
          for (let i = 0; i < colStr.length; i++) {
            col = col * 26 + (colStr.charCodeAt(i) - 64);
          }
          return { row: parseInt(rowStr) - 1, col: col - 1 };
        };
        const startCoord = parseCell(start);
        const endCoord = end ? parseCell(end) : startCoord;
        return { startCoord, endCoord };
      };

      // Math Functions
      const functions: Record<string, (args: string[]) => any> = {
        SUM: (args) => {
          let sum = 0;
          args.forEach(arg => {
            if (arg.includes(':')) {
              const { startCoord, endCoord } = parseRange(arg);
              for (let r = Math.min(startCoord.row, endCoord.row); r <= Math.max(startCoord.row, endCoord.row); r++) {
                for (let c = Math.min(startCoord.col, endCoord.col); c <= Math.max(startCoord.col, endCoord.col); c++) {
                  sum += getCellValue(r, c) || 0;
                }
              }
            } else {
              const match = arg.match(/([A-Z]+)(\d+)/);
              if (match) {
                const { row, col } = parseRange(arg).startCoord;
                sum += getCellValue(row, col) || 0;
              } else {
                sum += parseFloat(arg) || 0;
              }
            }
          });
          return sum;
        },
        AVERAGE: (args) => {
          let sum = 0;
          let count = 0;
          args.forEach(arg => {
            if (arg.includes(':')) {
              const { startCoord, endCoord } = parseRange(arg);
              for (let r = Math.min(startCoord.row, endCoord.row); r <= Math.max(startCoord.row, endCoord.row); r++) {
                for (let c = Math.min(startCoord.col, endCoord.col); c <= Math.max(startCoord.col, endCoord.col); c++) {
                  sum += getCellValue(r, c) || 0;
                  count++;
                }
              }
            } else {
              const match = arg.match(/([A-Z]+)(\d+)/);
              if (match) {
                const { row, col } = parseRange(arg).startCoord;
                sum += getCellValue(row, col) || 0;
              } else {
                sum += parseFloat(arg) || 0;
              }
              count++;
            }
          });
          return count > 0 ? sum / count : 0;
        },
        MIN: (args) => {
          let min = Infinity;
          args.forEach(arg => {
            if (arg.includes(':')) {
              const { startCoord, endCoord } = parseRange(arg);
              for (let r = Math.min(startCoord.row, endCoord.row); r <= Math.max(startCoord.row, endCoord.row); r++) {
                for (let c = Math.min(startCoord.col, endCoord.col); c <= Math.max(startCoord.col, endCoord.col); c++) {
                  min = Math.min(min, getCellValue(r, c) || 0);
                }
              }
            } else {
              min = Math.min(min, parseFloat(arg) || 0);
            }
          });
          return min;
        },
        MAX: (args) => {
          let max = -Infinity;
          args.forEach(arg => {
            if (arg.includes(':')) {
              const { startCoord, endCoord } = parseRange(arg);
              for (let r = Math.min(startCoord.row, endCoord.row); r <= Math.max(startCoord.row, endCoord.row); r++) {
                for (let c = Math.min(startCoord.col, endCoord.col); c <= Math.max(startCoord.col, endCoord.col); c++) {
                  max = Math.max(max, getCellValue(r, c) || 0);
                }
              }
            } else {
              max = Math.max(max, parseFloat(arg) || 0);
            }
          });
          return max;
        },
        CONCATENATE: (args) => args.join(''),
        IF: (args) => {
          const [condition, trueVal, falseVal] = args;
          // Very basic condition evaluator
          return eval(condition) ? trueVal : falseVal;
        }
      };

      // Replace functions with evaluated results
      Object.keys(functions).forEach(fnName => {
        const regex = new RegExp(`${fnName}\\(([^)]+)\\)`, 'g');
        expr = expr.replace(regex, (match, argsStr) => {
          const args = argsStr.split(',').map(a => a.trim());
          return functions[fnName](args).toString();
        });
      });

      // Replace remaining cell references
      expr = expr.replace(/([A-Z]+)(\d+)/g, (match, colStr, rowStr) => {
        let col = 0;
        for (let i = 0; i < colStr.length; i++) {
          col = col * 26 + (colStr.charCodeAt(i) - 64);
        }
        const row = parseInt(rowStr) - 1;
        return (getCellValue(row, col - 1) || 0).toString();
      });

      // Final Math Eval
      return new Function('return ' + expr)().toString();
    } catch {
      return "#ERROR!";
    }
  }, []);

  return { evaluateFormula };
};
