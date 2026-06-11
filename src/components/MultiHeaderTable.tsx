import React, { useMemo } from 'react';
import {
  PanelProps,
  Field,
  FieldType,
  DataFrame,
  getFieldDisplayName,
  formattedValueToString,
  GrafanaTheme2,
} from '@grafana/data';
import { PanelDataErrorView } from '@grafana/runtime';
import { useStyles2 } from '@grafana/ui';
import { css } from '@emotion/css';
import { MultiHeaderOptions } from '../types';

interface Props extends PanelProps<MultiHeaderOptions> {}

/** A single data column, with its display name split into two header rows. */
interface Column {
  field: Field;
  /** Top (group) header text. */
  top: string;
  /** Bottom (sub) header text, or null when the column has no second row. */
  sub: string | null;
}

/** A merged cell rendered in the top header row. */
interface TopCell {
  label: string;
  colSpan: number;
  /** 2 when the column has no sub-header and so spans both header rows. */
  rowSpan: number;
}

function readValue(field: Field, rowIndex: number): unknown {
  const values = field.values as unknown as { length: number; get?: (i: number) => unknown; [i: number]: unknown };
  return typeof values.get === 'function' ? values.get(rowIndex) : values[rowIndex];
}

function formatValue(field: Field, rowIndex: number): string {
  const value = readValue(field, rowIndex);
  if (field.display) {
    return formattedValueToString(field.display(value));
  }
  return value == null ? '' : String(value);
}

/**
 * Turn escape sequences typed in the options editor ("\r", "\n", "\t") into the
 * real control characters, since a text input can't hold a literal newline.
 */
function resolveDelimiter(delimiter: string): string {
  return delimiter.replace(/\\r/g, '\r').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
}

/** Split each field's display name into top/sub header parts. */
export function buildColumns(frame: DataFrame, frames: DataFrame[], rawDelimiter: string): Column[] {
  const delimiter = resolveDelimiter(rawDelimiter);
  return frame.fields.map((field) => {
    const name = getFieldDisplayName(field, frame, frames);
    const idx = delimiter ? name.indexOf(delimiter) : -1;
    if (idx === -1) {
      return { field, top: name, sub: null };
    }
    return {
      field,
      top: name.slice(0, idx),
      sub: name.slice(idx + delimiter.length),
    };
  });
}

/** Merge consecutive columns sharing a top header into spanning cells. */
export function buildTopRow(columns: Column[]): TopCell[] {
  const cells: TopCell[] = [];
  for (const col of columns) {
    if (col.sub === null) {
      // Standalone column: spans both header rows, never merges with siblings.
      cells.push({ label: col.top, colSpan: 1, rowSpan: 2 });
      continue;
    }
    const last = cells[cells.length - 1];
    if (last && last.rowSpan === 1 && last.label === col.top) {
      last.colSpan += 1;
    } else {
      cells.push({ label: col.top, colSpan: 1, rowSpan: 1 });
    }
  }
  return cells;
}

export const MultiHeaderTable: React.FC<Props> = ({ options, data, width, height, fieldConfig, id }) => {
  const styles = useStyles2(getStyles);

  const frame = data.series[0];

  const columns = useMemo(
    () => (frame ? buildColumns(frame, data.series, options.delimiter) : []),
    [frame, data.series, options.delimiter]
  );
  const topRow = useMemo(() => buildTopRow(columns), [columns]);

  if (!frame || frame.fields.length === 0) {
    return <PanelDataErrorView fieldConfig={fieldConfig} panelId={id} data={data} />;
  }

  const rowCount = frame.length;
  const headerClass = options.stickyHeader ? styles.stickyHeader : undefined;

  return (
    <div className={styles.wrapper} style={{ width, height }}>
      <table className={styles.table} data-testid="multi-header-table">
        <thead className={headerClass}>
          <tr>
            {options.showRowNumbers && (
              <th rowSpan={2} className={styles.th}>
                #
              </th>
            )}
            {topRow.map((cell, i) => (
              <th key={i} colSpan={cell.colSpan} rowSpan={cell.rowSpan} className={styles.th}>
                {cell.label}
              </th>
            ))}
          </tr>
          <tr>
            {columns
              .filter((col) => col.sub !== null)
              .map((col, i) => (
                <th key={i} className={styles.subTh}>
                  {col.sub}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rowCount }, (_, rowIndex) => (
            <tr key={rowIndex} className={rowIndex % 2 === 1 ? styles.oddRow : undefined}>
              {options.showRowNumbers && <td className={styles.numCell}>{rowIndex + 1}</td>}
              {columns.map((col, colIndex) => {
                const isNumeric = col.field.type === FieldType.number;
                return (
                  <td key={colIndex} className={isNumeric ? styles.numCell : styles.td}>
                    {formatValue(col.field, rowIndex)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => {
  const border = `1px solid ${theme.colors.border.weak}`;
  return {
    wrapper: css`
      overflow: auto;
    `,
    table: css`
      width: 100%;
      border-collapse: collapse;
      font-size: ${theme.typography.bodySmall.fontSize};
    `,
    stickyHeader: css`
      position: sticky;
      top: 0;
      z-index: 1;
    `,
    th: css`
      background: ${theme.colors.background.secondary};
      color: ${theme.colors.text.primary};
      font-weight: ${theme.typography.fontWeightMedium};
      text-align: center;
      padding: ${theme.spacing(0.75, 1)};
      border: ${border};
      white-space: nowrap;
    `,
    subTh: css`
      background: ${theme.colors.background.secondary};
      color: ${theme.colors.text.secondary};
      font-weight: ${theme.typography.fontWeightRegular};
      text-align: center;
      padding: ${theme.spacing(0.5, 1)};
      border: ${border};
      white-space: nowrap;
    `,
    td: css`
      padding: ${theme.spacing(0.5, 1)};
      border: ${border};
      text-align: left;
      white-space: nowrap;
    `,
    numCell: css`
      padding: ${theme.spacing(0.5, 1)};
      border: ${border};
      text-align: right;
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
    `,
    oddRow: css`
      background: ${theme.colors.background.secondary};
    `,
  };
};
