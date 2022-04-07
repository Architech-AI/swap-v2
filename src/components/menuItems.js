import {
  ROUTE_POOL,
  ROUTE_STATS,
  ROUTE_SWAP,
} from "../router/routes";

export default [
  {
    id: 0,
    label: "swap",
    route: ROUTE_SWAP,
    className: "",
  },
  {
    id: 1,
    label: "pool",
    route: ROUTE_POOL,
    className: "",
  },
  // {
  //   id: 2,
  //   label: "wrap",
  //   route: ROUTE_WRAP,
  //   className: "",
  // },
  {
    id: 3,
    label: "stats",
    route: ROUTE_STATS,
    className: "",
  },
];
