# FizzBuzz Plugin-Based Architecture - Detailed Documentation

## 👻 Author

Created by **Stanislav Kinash** / **neprostostas**

## Introduction

This document provides detailed documentation for the maximum extensibility version of the FizzBuzz solution, which is based on a plugin-based architecture. This architecture allows users to create custom plugins that define various aspects of the FizzBuzz logic, such as rule group selectors, rule selectors, rule modifiers, and result formatters. Users can seamlessly integrate their custom functionality into the FizzBuzz solution without modifying the core code.

## Table of Contents

1. [Overview](#overview)
2. [Plugin Structure](#plugin-structure)
3. [Interfaces](#interfaces)
    - [FizzBuzzRule](#fizzbuzzrule)
    - [RuleEvaluator](#ruleevaluator)
    - [RuleDecorator](#ruledecorator)
    - [TaggedRuleGroup](#taggedrulegroup)
    - [RuleGroupSelector](#rulegroupselector)
    - [RuleGroupModifier](#rulegroupmodifier)
    - [RuleSet](#ruleset)
    - [RuleSelector](#ruleselector)
    - [ResultTransformer](#resulttransformer)
    - [ResultFormatter](#resultformatter)
    - [FizzBuzzPlugin](#fizzbuzzplugin)
4. [Core Functions](#core-functions)
    - [applyDecorators](#applydecorators)
    - [applyRuleEvents](#applyruleevents)
    - [evaluateRule](#evaluaterule)
    - [evaluateRuleCombinator](#evaluaterulecombinator)
    - [getRuleTag](#getruletag)
    - [applyResultTransformer](#applyresulttransformer)
5. [FizzBuzz Function](#fizzbuzz-function)
6. [Creating Custom Plugins](#creating-custom-plugins)
7. [Example Usage](#example-usage)

## Overview

The FizzBuzz solution with a plugin-based architecture offers maximum extensibility, allowing users to create custom plugins that extend and modify the FizzBuzz logic. The solution is designed with flexibility in mind, enabling users to define custom rule group selectors, rule selectors, rule group modifiers, and result formatters.

## Plugin Structure

A plugin is an object that implements the `FizzBuzzPlugin` interface. It can define the following properties:

- `ruleGroupSelectors`: An array of functions that select rule groups based on specific criteria for each number.
- `ruleSelectors`: An array of functions that select rule sets based on specific criteria for each number.
- `ruleGroupModifiers`: An array of functions that modify existing rule groups based on specific criteria.
- `resultFormatters`: An array of functions that format the final results of the FizzBuzz sequence.

## Interfaces

### FizzBuzzRule

Represents a single FizzBuzz rule.

```typescript
type FizzBuzzRule = {
  evaluator?: RuleEvaluator;
  output: string;
  events?: ((num: number) => void)[];
  filter?: RuleEvaluator;
  priority?: number;
  resultTransformer?: ResultTransformer;
};
```

- `tag`: A tag or label for the rule group.
- `rules`: An array of FizzBuzz rules in the group.
- `selectBehavior`: Determines the rule selection behavior for the group. Possible values are 'all', 'first', and 'last'.
- `decorators`: An optional array of rule decorators that will be applied to all rules in the group.
- `resultTransformer`: An optional function that transforms the output string of all rules in the group.


### RuleEvaluator

Represents a function that evaluates a rule condition for a given number and returns a boolean.

```typescript
type RuleEvaluator = (num: number, context?: any) => boolean;
```

- `num`: The number for which the rule condition is evaluated.
- `context`: An optional context object that provides additional information to the rule evaluator.


### RuleDecorator

Represents a function that modifies a FizzBuzz rule.

```typescript
type RuleDecorator = (rule: FizzBuzzRule, context?: any) => FizzBuzzRule;
```

- `rule`: The FizzBuzz rule to be modified.
- `context`: An optional context object that provides additional information for rule modification.


### TaggedRuleGroup

Represents a group of FizzBuzz rules with metadata.

```typescript
type TaggedRuleGroup = {
    tag: string;
    rules: FizzBuzzRule[];
    selectBehavior: 'all' | 'first' | 'last';
    decorators?: RuleDecorator[];
    resultTransformer?: ResultTransformer;
};
```

- `tag`: A tag or label for the rule group.
- `rules`: An array of FizzBuzz rules in the group.
- `selectBehavior`: Determines the rule selection behavior for the group. Possible values are 'all', 'first', and 'last'.
- `decorators`: An optional array of rule decorators that will be applied to all rules in the group.
- `resultTransformer`: An optional function that transforms the output string of all rules in the group.


### RuleGroupSelector

Represents a function that selects rule groups based on specific criteria for each number.

```typescript
type RuleGroupSelector = (num: number, context?: any) => TaggedRuleGroup[] | undefined;
```

- `num`: The number for which the rule groups are selected.
- `context`: An optional context object that provides additional information for rule group selection.


### RuleGroupModifier

Represents a function that modifies existing rule groups based on specific criteria.

```typescript
type RuleGroupModifier = (ruleGroup: TaggedRuleGroup[], context?: any) => TaggedRuleGroup[];
```

- `ruleGroup`: The existing rule groups to be modified.
- `context`: An optional context object that provides additional information for rule group modification.


### RuleSet

Represents a set of FizzBuzz rules with a condition for selection.

```typescript
type RuleSet = {
    condition: RuleEvaluator;
    rules: FizzBuzzRule[];
};
```

- `condition`: A function that evaluates the condition for selecting the rule set.
- `rules`: An array of FizzBuzz rules in the rule set.


### RuleSelector

Represents a function that selects rule sets based on specific criteria for each number.

```typescript
type RuleSelector = (num: number, context?: any) => RuleSet[] | undefined;
```

- `num`: The number for which the rule sets are selected.
- `context`: An optional context object that provides additional information for rule set selection.


### ResultTransformer

Represents a function that transforms the result of a rule.

```typescript
type ResultTransformer = (result: string, num: number, context?: any) => string;
```

- `result`: The original output string of the rule.
- `num`: The number for which the rule was applied.
- `context`: An optional context object that provides additional information for result transformation.


### ResultFormatter

Represents a function that formats the final results of the FizzBuzz sequence.

```typescript
type ResultFormatter = (results: string[]) => string;
```

- `results`: An array of individual FizzBuzz results for each number.


### FizzBuzzPlugin

Represents a custom plugin for extending the FizzBuzz solution.

```typescript
interface FizzBuzzPlugin {
    ruleGroupSelectors?: RuleGroupSelector[];
    ruleSelectors?: RuleSelector[];
    ruleGroupModifiers?: RuleGroupModifier[];
    resultFormatters?: ResultFormatter[];
}
```

- `ruleGroupSelectors`: An array of functions that select rule groups based on specific criteria for each number.
- `ruleSelectors`: An array of functions that select rule sets based on specific criteria for each number.
- `ruleGroupModifiers`: An array of functions that modify existing rule groups based on specific criteria.
- `resultFormatters`: An array of functions that format the final results of the FizzBuzz sequence.

## Core Functions

### applyDecorators

Applies decorators to a FizzBuzz rule.

```typescript
function applyDecorators(rule: FizzBuzzRule, decorators: RuleDecorator[], context?: any): FizzBuzzRule;
```

- `rule`: The FizzBuzz rule to be modified.
- `decorators`: An array of rule decorators to be applied to the rule.
- `context`: An optional context object that provides additional information for rule modification.


### applyRuleEvents

Applies events associated with a FizzBuzz rule.

```typescript
function applyRuleEvents(rule: FizzBuzzRule, num: number): void;
```

- `rule`: The FizzBuzz rule that may have associated events.
- `num`: The number for which the rule is applied.


### evaluateRule

Evaluates a FizzBuzz rule for a given number.

```typescript
function evaluateRule(rule: FizzBuzzRule, num: number, context?: any): boolean;
```

- `rule`: The FizzBuzz rule to be evaluated.
- `num`: The number for which the rule condition is evaluated.
- `context`: An optional context object that provides additional information to the rule evaluator.


### evaluateRuleCombinator

Evaluates a rule combinator (AND, OR, NOT) for a given number.

```typescript
function evaluateRuleCombinator(combinator: RuleCombinator, num: number, context?: any): boolean;
```

- `combinator`: The rule combinator (AND, OR, NOT) to be evaluated.
- `num`: The number for which the rule combinator is applied.
- `context`: An optional context object that provides additional information for rule evaluation.


### getRuleTag

Retrieves the tag of a FizzBuzz rule from the associated rule group.

```typescript
function getRuleTag(rule: FizzBuzzRule, matchingGroups: TaggedRuleGroup[]): string;
```

- `rule`: The FizzBuzz rule for which the tag is retrieved.
- `matchingGroups`: An array of rule groups that contain the rule.


### applyResultTransformer

Applies a result transformer to a FizzBuzz rule's output.

```typescript
function applyResultTransformer(result: string, num: number, matchingGroups: TaggedRuleGroup[]): string;
```

- `result`: The original output string of the rule.
- `num`: The number for which the rule was applied.
- `matchingGroups`: An array of rule groups that contain the rule.


## FizzBuzz Function

The main FizzBuzz function that generates the FizzBuzz sequence.

```typescript
function fizzBuzz(
  start: number,
  end: number,
  step: number,
  plugins: FizzBuzzPlugin[] = [],
  defaultOutput: (num: number) => string = (num) => num.toString(),
  resultFormatter: ResultFormatter = (results) => results.join(' '),
): string;
```

- `start`: The starting number of the FizzBuzz sequence.
- `end`: The ending number of the FizzBuzz sequence.
- `step`: The step size to increment the numbers in the sequence.
- `plugins`: An array of custom plugins that extend the FizzBuzz logic.
- `defaultOutput`: A function that provides the default output for numbers that don't meet any custom rule.
- `resultFormatter`: A function that formats the final results of the FizzBuzz sequence.


## Creating Custom Plugins

To create custom plugins, users need to implement the FizzBuzzPlugin interface and define the desired rule group selectors, rule selectors, rule group modifiers, and result formatters. Once the plugin is created, it can be passed to the fizzBuzz function along with other plugins, allowing seamless integration of custom functionality.

## Example Usage

Below is an example of how to use the FizzBuzz solution with custom plugins:

```typescript
// Define custom plugins
const customPlugin1: FizzBuzzPlugin = {
  ruleGroupSelectors: [customRuleGroupSelector],
  ruleSelectors: [customRuleSelector],
  resultFormatters: [customResultFormatter],
};

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
```

In this example, we have defined a custom plugin customPlugin1 that includes custom rule group selectors, rule selectors, and a custom result formatter. The fizzBuzz function is then called with the custom plugin, resulting in a fully customizable and extensible FizzBuzz sequence based on the defined rules and logic within the plugin.