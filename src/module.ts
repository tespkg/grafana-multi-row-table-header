import { PanelPlugin } from '@grafana/data';
import { MultiHeaderOptions } from './types';
import { MultiHeaderTable } from './components/MultiHeaderTable';

export const plugin = new PanelPlugin<MultiHeaderOptions>(MultiHeaderTable).setPanelOptions((builder) => {
  return builder
    .addTextInput({
      path: 'delimiter',
      name: 'Header delimiter',
      description:
        'Character(s) inside a column name that split it into two header rows. Text before the delimiter becomes the top (group) header, text after becomes the sub header. Use \\r for a carriage return.',
      defaultValue: '\r',
      settings: {
        // Show the escape sequence in the editor instead of an invisible char.
        placeholder: '\\r',
      },
    })
    .addBooleanSwitch({
      path: 'showRowNumbers',
      name: 'Show row numbers',
      description: 'Prepend an auto-incrementing "#" column.',
      defaultValue: false,
    })
    .addBooleanSwitch({
      path: 'stickyHeader',
      name: 'Sticky header',
      description: 'Pin the two header rows while the table body scrolls.',
      defaultValue: true,
    });
});
