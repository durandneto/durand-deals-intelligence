export const columns = [
  {
    Header: "Announcement Date",
    accessor: "Announcement Date"
    // filterMap: "check"
  },
  {
    Header: "Deal type",
    accessor: "Deal type"
    // filterMap: "check"
  },
  {
    Header: "Buyer/in-licenser/investor",
    accessor: "Buyer/in-licenser/investor",
    filterMap: "equals",
    id: "Buyer/in-licenser/investor"
  },
  {
    Header: "Target/partner/investee",
    accessor: "Target/partner/investee"
    // filterMap: "check"
  },
  {
    Header: "Total deal value($m)",
    accessor: "Total deal value($m)",
    filterMap: "between"
  },
  {
    Header: "Therapy Area(s)",
    accessor: "Therapy Area(s)"
    // filterMap: "equals"
  },
  {
    Header: "Stage of lead product",
    accessor: "Stage of lead product"
    // filterMap: "equals"
  }
];
