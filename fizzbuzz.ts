type FizzBuzzRule = {
  evaluator?: RuleEvaluator;
  output: string;
  events?: ((num: number) => void)[];
  filter?: RuleEvaluator;
  priority?: number;
  resultTransformer?: ResultTransformer;
};

type RuleEvaluator = (num: number, context?: any) => boolean;

type RuleDecorator = (rule: FizzBuzzRule, context?: any) => FizzBuzzRule;

type TaggedRuleGroup = {
  tag: string;
  rules: FizzBuzzRule[];
  selectBehavior: 'all' | 'first' | 'last';
  decorators?: RuleDecorator[];
  resultTransformer?: ResultTransformer;
};

type RuleGroupSelector = (num: number, context?: any) => TaggedRuleGroup[] | undefined;

type RuleGroupModifier = (ruleGroup: TaggedRuleGroup[], context?: any) => TaggedRuleGroup[];

type RuleSet = {
  condition: RuleEvaluator;
  rules: FizzBuzzRule[];
};

type RuleSelector = (num: number, context?: any) => RuleSet[] | undefined;

type ResultTransformer = (result: string, num: number, context?: any) => string;

type ResultFormatter = (results: string[]) => string;

interface FizzBuzzPlugin {
  ruleGroupSelectors?: RuleGroupSelector[];
  ruleSelectors?: RuleSelector[];
  ruleGroupModifiers?: RuleGroupModifier[];
  resultFormatters?: ResultFormatter[];
}

function applyDecorators(rule: FizzBuzzRule, decorators: RuleDecorator[], context?: any): FizzBuzzRule {
  return decorators.reduce((modifiedRule, decorator) => decorator(modifiedRule, context), rule);
}

function applyRuleEvents(rule: FizzBuzzRule, num: number): void {
  if (rule.events) {
    rule.events.forEach((event) => event(num));
  }
}

function evaluateRule(rule: FizzBuzzRule, num: number, context?: any): boolean {
  if (rule.evaluator) {
    return rule.evaluator(num, context);
  } else if (rule.condition) {
    return rule.condition(num, context);
  }
  return false;
}

function evaluateRuleCombinator(combinator: RuleCombinator, num: number, context?: any): boolean {
  switch (combinator.type) {
    case 'AND':
      return combinator.rules.every((rule) => evaluateRule(rule, num, context));
    case 'OR':
      return combinator.rules.some((rule) => evaluateRule(rule, num, context));
    case 'NOT':
      return !evaluateRule(combinator.rule, num, context);
    default:
      return false;
  }
}

function getRuleTag(rule: FizzBuzzRule, matchingGroups: TaggedRuleGroup[]): string {
  const group = matchingGroups.find((group) => group.rules.includes(rule));
  return group ? group.tag : 'Default';
}

function applyResultTransformer(result: string, num: number, matchingGroups: TaggedRuleGroup[]): string {
  const ruleTransformers = matchingGroups.flatMap((group) => group.resultTransformer || []);
  return ruleTransformers.reduce((modifiedResult, transformer) => transformer(modifiedResult, num), result);
}

function fizzBuzz(
  start: number,
  end: number,
  step: number,
  plugins: FizzBuzzPlugin[] = [],
  defaultOutput: (num: number) => string = (num) => num.toString(),
  resultFormatter: ResultFormatter = (results) => results.join(' '),
): string {
  const ruleGroupSelectors: RuleGroupSelector[] = [];
  const ruleSelectors: RuleSelector[] = [];
  const ruleGroupModifiers: RuleGroupModifier[] = [];
  const resultFormatters: ResultFormatter[] = [];

  // Extract the plugin functions from the plugins
  for (const plugin of plugins) {
    if (plugin.ruleGroupSelectors) {
      ruleGroupSelectors.push(...plugin.ruleGroupSelectors);
    }
    if (plugin.ruleSelectors) {
      ruleSelectors.push(...plugin.ruleSelectors);
    }
    if (plugin.ruleGroupModifiers) {
      ruleGroupModifiers.push(...plugin.ruleGroupModifiers);
    }
    if (plugin.resultFormatters) {
      resultFormatters.push(...plugin.resultFormatters);
    }
  }

  function applyRules(i: number): string {
    let result = "";
    const matchingGroups: TaggedRuleGroup[] = [];

    for (const ruleGroupSelector of ruleGroupSelectors) {
      const taggedRuleGroups = ruleGroupSelector(i) || [];
      matchingGroups.push(...taggedRuleGroups);
    }

    const ruleSets: RuleSet[] = [];

    for (const ruleSelector of ruleSelectors) {
      const sets = ruleSelector(i) || [];
      ruleSets.push(...sets);
    }

    for (const ruleSet of ruleSets) {
      if (ruleSet.condition(i)) {
        const sortedRules = ruleSet.rules
          .sort((a, b) => (a.priority || 0) - (b.priority || 0))
          .filter((rule, index, self) => !index || rule !== self[index - 1]); // Remove duplicates

        for (const rule of sortedRules) {
          if (rule.filter && !rule.filter(i)) {
            continue; // Skip the rule if the filter condition is not satisfied
          }

          if (evaluateRule(rule, i)) {
            applyRuleEvents(rule, i);
            const ruleGroupsWithRule = matchingGroups.filter((group) => group.rules.includes(rule));
            const modifiedRule = ruleGroupsWithRule.flatMap((group) => group.decorators || []).reduce(applyDecorators, rule);
            result += `[${getRuleTag(rule, ruleGroupsWithRule)}: ${applyResultTransformer(
              modifiedRule.output,
              i,
              ruleGroupsWithRule
            )}]`;
            break; // Apply the first matching rule only
          }
        }

        if (result !== "") {
          break; // Stop applying rules if a matching rule is found in the current rule set
        }
      }
    }

    if (result === "") {
      result = defaultOutput(i);
    }

    return result;
  }

  const sequenceLength = Math.ceil((end - start + 1) / step);
  const results: string[] = Array.from({ length: sequenceLength }, (_, index) =>
    applyRules(start + index * step)
  );

  const finalResult = resultFormatter(results);

  return finalResult;
}

// Define custom plugins
const customPlugin1: FizzBuzzPlugin = {
  ruleGroupSelectors: [customRuleGroupSelector],
  ruleSelectors: [customRuleSelector],
  resultFormatters: [customResultFormatter],
};

// Define custom plugins 2 and 3 if needed

const start = 10;
const end = 50;
const step = 2;

const result: string = fizzBuzz(
  start,
  end,
  step,
  [customPlugin1 /*, customPlugin2, customPlugin3, ...*/],
  (num) => `NotDivisible-${num}`,
  (results) => results.join('|'),
);

console.log(result);
