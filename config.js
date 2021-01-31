const aggKey = "amount";
const csvFile = "http://localhost:8000/data/flare.csv";

const breakCategories = [["c1", "Category 1"], ["c2", "Category 2"], ["c3", "Category 3"], ["c4", "Category 4"]]

const initialOrder = ["c1", "c2", "c3"];
const initialLib = "All";
const maxDepth = Math.min(3, breakCategories.length);