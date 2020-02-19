/*jshint esversion: 6 */

function format_number(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function sortNumber(a, b) {
    return a - b;
}

function quantile(array, percentile) {
    array.sort(sortNumber);
    index = percentile / 100.0 * (array.length - 1);
    if (Math.floor(index) == index) {
        result = array[index];
    } else {
        i = Math.floor(index);
        fraction = index - i;
        result = array[i] + (array[i + 1] - array[i]) * fraction;
    }
    return result;
}

function linearGradient(domain, range) {
    return d3.scaleLinear().domain(domain).range(range);
}

const median = arr => {
    const mid = Math.floor(arr.length / 2),
        nums = [...arr].sort((a, b) => a - b);
    return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};
