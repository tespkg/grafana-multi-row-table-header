import { toDataFrame, FieldType } from '@grafana/data';
import { buildColumns, buildTopRow } from './MultiHeaderTable';

function frame() {
  return toDataFrame({
    fields: [
      { name: 'company', type: FieldType.string, values: ['BP'] },
      { name: 'Hydrocarbon', type: FieldType.string, values: ['oil'] },
      { name: '2015\r1P', type: FieldType.number, values: [1] },
      { name: '2015\r2P', type: FieldType.number, values: [2] },
      { name: '2016\r1P', type: FieldType.number, values: [3] },
      { name: '2016\r2P', type: FieldType.number, values: [4] },
    ],
  });
}

describe('buildColumns', () => {
  it('splits names on the delimiter and leaves plain names spanning', () => {
    const f = frame();
    const cols = buildColumns(f, [f], '\r');
    expect(cols.map((c) => [c.top, c.sub])).toEqual([
      ['company', null],
      ['Hydrocarbon', null],
      ['2015', '1P'],
      ['2015', '2P'],
      ['2016', '1P'],
      ['2016', '2P'],
    ]);
  });

  it('accepts an escaped delimiter typed in the options editor', () => {
    const f = frame();
    const cols = buildColumns(f, [f], '\\r');
    expect(cols[2]).toMatchObject({ top: '2015', sub: '1P' });
  });
});

describe('buildTopRow', () => {
  it('merges consecutive columns under a shared top header', () => {
    const f = frame();
    const cells = buildTopRow(buildColumns(f, [f], '\r'));
    expect(cells).toEqual([
      { label: 'company', colSpan: 1, rowSpan: 2 },
      { label: 'Hydrocarbon', colSpan: 1, rowSpan: 2 },
      { label: '2015', colSpan: 2, rowSpan: 1 },
      { label: '2016', colSpan: 2, rowSpan: 1 },
    ]);
  });
});
