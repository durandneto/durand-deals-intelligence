import React from "react";
import { render } from "react-dom";
import { makeData, Logo, Tips } from "./Utils";
import matchSorter from "match-sorter";

// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";

import { columns } from "./s3/table1/settings";
import { data } from "./s3/table1/data";

const filtersMap = {
  between: NumberRangeColumnFilter,
  ">": SliderColumnFilter,
  equals: SelectColumnFilter,
  check: CheckboxColumnFilter
};

// This is a custom filter UI for selecting
// a unique option from a list
function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
  filter,
  onChange
}) {
  // console.log('preFilteredRows', preFilteredRows);
  // Calculate the options for filtering
  // using the preFilteredRows
  // const options = React.useMemo(() => {
  const options = new Set();
  data
    // .filter((r) => r.id === id)
    .forEach((row) => {
      // console.log(id, row[id]);
      options.add(row[id]);
    });

  // Render a multi-select box
  return (
    <select
      onChange={(event) => onChange(event.target.value)}
      style={{ width: "100%" }}
      value={filter ? filter.value : "all"}
    >
      <option value="">All</option>
      {Array.from(options).map((option, i) => (
        <option key={i} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
// This is a custom filter UI for selecting
// a unique option from a list
function CheckboxColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id }
}) {
  const [multiMode, setMultiMode] = React.useState(false);

  const options = React.useMemo(() => {
    let counts = {};
    preFilteredRows.forEach((x) => {
      x = x.values[id].toString();

      counts[x] = (counts[x] || 0) + 1;
    });
    return counts;
  }, [id, preFilteredRows]);

  const [checked, setChecked] = React.useState(Object.keys(options));

  const onChange = (e) => {
    const t = e.target.name.toString();

    if (!multiMode) {
      setFilter((old) => (old && old.includes(t) ? undefined : [t]));
      checked.includes(t) && checked.length === 1
        ? setChecked(Object.keys(options))
        : setChecked([t]);
    }

    if (multiMode) {
      if (checked && checked.includes(t)) {
        setFilter(checked.filter((v) => v !== t));
        // setChecked((p) => p.filter((v) => v !== t));
        setChecked((prevChecked) => {
          if (prevChecked.length === 1) return Object.keys(options);
          return prevChecked.filter((v) => v !== t);
        });
      } else {
        setFilter([...checked, t]);
        setChecked((prevChecked) => [...prevChecked, t]);
      }
    }
  };

  return (
    <>
      {Object.entries(options).map(([option, count], i) => {
        // console.log(option, checked);
        return (
          <span>
            <input
              type="checkbox"
              name={option}
              id={option}
              checked={checked.includes(option)}
              onChange={onChange}
            />
            {option} ({count})
          </span>
        );
      })}
    </>
  );
}

// This is a custom filter UI that uses a
// slider to set the filter value between a column's
// min and max values
function SliderColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id }
}) {
  // Calculate the min and max
  // using the preFilteredRows

  const [min, max] = React.useMemo(() => {
    let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    preFilteredRows.forEach((row) => {
      min = Math.min(row.values[id], min);
      max = Math.max(row.values[id], max);
    });
    return [min, max];
  }, [id, preFilteredRows]);

  return (
    <>
      <input
        type="range"
        min={min}
        max={max}
        value={filterValue || min}
        onChange={(e) => {
          setFilter(parseInt(e.target.value, 10));
        }}
      />
      <button onClick={() => setFilter(undefined)}>Off</button>
    </>
  );
}

// This is a custom UI for our 'between' or number range
// filter. It uses two number boxes and filters rows to
// ones that have values between the two
function NumberRangeColumnFilter({
  column: { filterValue = [], preFilteredRows, setFilter, id }
}) {
  const [min, max] = React.useMemo(() => {
    let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    preFilteredRows.forEach((row) => {
      min = Math.min(row.values[id], min);
      max = Math.max(row.values[id], max);
    });
    return [min, max];
  }, [id, preFilteredRows]);

  return (
    <div
      style={{
        display: "flex"
      }}
    >
      <input
        value={filterValue[0] || ""}
        type="number"
        onChange={(e) => {
          const val = e.target.value;
          setFilter((old = []) => [
            val ? parseInt(val, 10) : undefined,
            old[1]
          ]);
        }}
        placeholder={`Min (${min})`}
        style={{
          width: "70px",
          marginRight: "0.5rem"
        }}
      />
      to
      <input
        value={filterValue[1] || ""}
        type="number"
        onChange={(e) => {
          const val = e.target.value;
          setFilter((old = []) => [
            old[0],
            val ? parseInt(val, 10) : undefined
          ]);
        }}
        placeholder={`Max (${max})`}
        style={{
          width: "70px",
          marginLeft: "0.5rem"
        }}
      />
    </div>
  );
}

function fuzzyTextFilterFn(rows, id, filterValue) {
  return matchSorter(rows, filterValue, { keys: [(row) => row.values[id]] });
}

// Let the table remove the filter if the string is empty
fuzzyTextFilterFn.autoRemove = (val) => !val;

// const columns = [
//   {
//     Header: "Name",
//     columns: [
//       {
//         Header: "First Name",
//         accessor: "firstName",
//   filterMethod: (filter, row) =>
//     row[filter.id].startsWith(filter.value) &&
//     row[filter.id].endsWith(filter.value)
// },
//       {
//         Header: "Last Name",
//         id: "lastName",
//         accessor: (d) => d.lastName,
//         filterMethod: (filter, rows) =>
//           matchSorter(rows, filter.value, { keys: ["lastName"] }),
//         filterAll: true
//       }
//     ]
//   },
//   {
//     Header: "Info",
//     columns: [
//       {
//         Header: "Age",
//         accessor: "age"
//       },
//     {
//       Header: "Over 21",
//       accessor: "age",
//       id: "over",
//       Cell: ({ value }) => (value >= 21 ? "Yes" : "No"),
//       filterMethod: (filter, row) => {
//         if (filter.value === "all") {
//           return true;
//         }
//         if (filter.value === "true") {
//           return row[filter.id] >= 21;
//         }
//         return row[filter.id] < 21;
//       },
//       Filter: ({ filter, onChange }) => (
//         <select
//           onChange={(event) => onChange(event.target.value)}
//           style={{ width: "100%" }}
//           value={filter ? filter.value : "all"}
//         >
//           <option value="all">Show All</option>
//           <option value="true">Yes</option>
//           <option value="false">No</option>
//         </select>
//       )
//     }
//   ]
// }
// ];

columns.map((d) => {
  // console.log(d.filterMap);
  switch (true) {
    case d.filterMap === "equals":
      // d.Cell = ({ value }) => (value >= 21 ? "Yes" : "No");
      d.filterMethod = (filter, row) => {
        if (filter.value === "all") {
          return true;
        }
        return row[filter.id] === filter.value;
      };

      d.Filter = SelectColumnFilter;
      break;
    default:
  }

  // console.log(columns);

  //     filterMethod: (filter, row) =>
  //     row[filter.id].startsWith(filter.value) &&
  //     row[filter.id].endsWith(filter.value)
  // },

  /**
   


        {
    Header: "Over 21",
    accessor: "age",
    id: "over",
    Cell: ({ value }) => (value >= 21 ? "Yes" : "No"),
    filterMethod: (filter, row) => {
      if (filter.value === "all") {
        return true;
      }
      if (filter.value === "true") {
        return row[filter.id] >= 21;
      }
      return row[filter.id] < 21;
    },
    Filter: ({ filter, onChange }) => (
      <select
        onChange={(event) => onChange(event.target.value)}
        style={{ width: "100%" }}
        value={filter ? filter.value : "all"}
      >
        <option value="all">Show All</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    )
  }
]
}



   */
});

const options = new Set();
data
  // .filter((r) => r.id === id)
  .forEach((row) => {
    // console.log(id, row[id]);
    const dt = row["Announcement Date"].split("/")[2];
    if (dt) {
      options.add(dt);
    }
  });

class Welcome extends React.Component {
  render() {
    return (
      <span>
        {" "}
        {options.forEach((y, i) => {
          console.log(y);
          return (
            <span key={`input-${i}`}>
              <input type="checkbox" />
              {y}
            </span>
          );
        })}
      </span>
    );
  }
}

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      data,
      optionsv2: options,
      expanded: {},
      searchInput: ""
    };
  }

  handleChange = (event) => {
    this.setState({ searchInput: event.target.value }, () => {
      this.globalSearch();
    });
  };

  filteringByDate = (date) => {
    console.log(date);
    let filteredData = data.filter((obj) => {
      if (obj["Announcement Date"].indexOf(date) !== -1) {
        return obj;
      }
    });
    this.setState({ data: filteredData });
  };

  globalSearch = () => {
    let { searchInput } = this.state;
    let filteredData = data.filter((obj) => {
      for (const value of Object.values(obj)) {
        if (
          value.toString().toLowerCase().includes(searchInput.toLowerCase())
        ) {
          return obj;
        }
      }
    });
    this.setState({ data: filteredData });
  };

  render() {
    const { data, searchInput, optionsv2 } = this.state;
    return (
      <div>
        <br />
        <div className="detailWrapperItem">
          <div className="detailWrapperItemLeft">
            <input
              name="searchInput"
              value={searchInput || ""}
              onChange={this.handleChange}
              label="Search"
            />
          </div>
          <div>
            <input
              type="checkbox"
              onChange={() => this.filteringByDate(2018)}
            />{" "}
            2018
            <input
              type="checkbox"
              onChange={() => this.filteringByDate(2019)}
            />{" "}
            2019
            <input
              type="checkbox"
              onChange={() => this.filteringByDate(2020)}
            />{" "}
            2020
            <input
              type="checkbox"
              onChange={() => this.filteringByDate(2021)}
            />{" "}
            2021
          </div>
        </div>
        <br />
        <br />
        <ReactTable
          data={data}
          columns={columns}
          defaultPageSize={10}
          filterable
          defaultFilterMethod={(filter, row) =>
            String(row[filter.id].toLowerCase()).includes(
              filter.value.toLowerCase()
            )
          }
          expanded={this.state.expanded}
          className="-striped -highlight"
          getTrProps={(state, rowInfo, column, instance, expanded) => {
            return {
              onClick: (e) => {
                const expanded = { ...this.state.expanded };
                expanded[rowInfo.viewIndex] = this.state.expanded[
                  rowInfo.viewIndex
                ]
                  ? false
                  : true;
                this.setState({ expanded });
              }
            };
          }}
          SubComponent={(row) => {
            return (
              <div style={{ padding: "20px" }}>
                <em>
                  Clicking on one of the rows should expand to reveal the
                  additional pieces of data from the columns in the table.
                  Initially we can display the following
                </em>
                <br />
                <br />
                <div>
                  <div className="detailWrapperItem">
                    <div className="detailWrapperItemLeft">Completion date</div>
                    <div className="detailWrapperItemRight">
                      {row.original["Completion date"]}
                    </div>
                  </div>

                  <div className="detailWrapperItem">
                    <div className="detailWrapperItemLeft">
                      Country of buyer & Region
                    </div>
                    <div className="detailWrapperItemRight">
                      {row.original["Country of Buyer"]}
                    </div>
                  </div>

                  <div className="detailWrapperItem">
                    <div className="detailWrapperItemLeft">
                      Country of target & Region
                    </div>
                    <div className="detailWrapperItemRight">
                      {row.original["Country of Target"]}
                    </div>
                  </div>

                  <div className="detailWrapperItem">
                    <div className="detailWrapperItemLeft">Technology</div>
                    <div className="detailWrapperItemRight">
                      {row.original["Technology(s)"]}
                    </div>
                  </div>

                  <div className="detailWrapperItem">
                    <div className="detailWrapperItemLeft">Lead Product</div>
                    <div className="detailWrapperItemRight">
                      {row.original["Lead product(s)"]}
                    </div>
                  </div>

                  <div className="detailWrapperItem">
                    <div className="detailWrapperItemLeft">Indications</div>
                    <div className="detailWrapperItemRight">
                      {row.original["Indication(s)"]}
                    </div>
                  </div>
                  <div className="detailWrapperItem">
                    <div className="detailWrapperItemLeft">
                      Mechanism of Action
                    </div>
                    <div className="detailWrapperItemRight">
                      {row.original["Mechanism of action"]}
                    </div>
                  </div>
                </div>
              </div>
            );
          }}
        />
        <br />
        <Tips />
        <Logo />
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));
