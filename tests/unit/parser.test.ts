import { describe, it, expect } from 'vitest';
import { stripFences, extractJson, repairJson, parseJson } from '../../src/lib/server/ai/parser';

describe('stripFences', () => {
  it('removes json fences', () => {
    expect(stripFences('```json\n{"a":1}\n```')).toBe('{"a":1}');
  });
  it('removes plain fences', () => {
    expect(stripFences('```\n{"a":1}\n```')).toBe('{"a":1}');
  });
  it('returns unchanged if no fences', () => {
    expect(stripFences('{"a":1}')).toBe('{"a":1}');
  });
});

describe('extractJson', () => {
  it('extracts object from surrounding text', () => {
    expect(extractJson('here is the json: {"a":1} ok')).toBe('{"a":1}');
  });
  it('extracts array', () => {
    expect(extractJson('result: [1,2,3] done')).toBe('[1,2,3]');
  });
  it('handles nested objects', () => {
    expect(extractJson('{"a":{"b":2}}')).toBe('{"a":{"b":2}}');
  });
});

describe('repairJson', () => {
  it('removes trailing commas before }', () => {
    expect(repairJson('{"a":1,}')).toBe('{"a":1}');
  });
  it('removes trailing commas before ]', () => {
    expect(repairJson('[1,2,3,]')).toBe('[1,2,3]');
  });
  it('closes unclosed braces', () => {
    const result = repairJson('{"a":1');
    expect(() => JSON.parse(result)).not.toThrow();
  });
});

describe('parseJson', () => {
  it('parses clean json', () => {
    expect(parseJson<{ a: number }>('{"a":1}')).toEqual({ a: 1 });
  });
  it('parses fenced json', () => {
    expect(parseJson<{ a: number }>('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });
  it('parses json with trailing comma', () => {
    expect(parseJson<{ a: number }>('{"a":1,}')).toEqual({ a: 1 });
  });
});
