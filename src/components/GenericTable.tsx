type ColumnDefinition<T> = {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
};

type TableProps<T> = {
  data: T[];
  columns: ColumnDefinition<T>[];
};

function GenericTable<T>({ data, columns }: TableProps<T>) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={String(col.key)}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {columns.map((col) => (
              <td key={String(col.key)}>
                {col.render
                  ? col.render(row[col.key], row)
                  : String(row[col.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default GenericTable;
