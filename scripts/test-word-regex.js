const PERSIAN_LETTERS = '\\u0600-\\u06FF';
const SUFFIX = '(?:ترین|تر|ها|های|ی|انی|اری)?';
function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function wordRegex(word) {
  return new RegExp(`(?:^|[^${PERSIAN_LETTERS}])${esc(word)}${SUFFIX}(?=$|[^${PERSIAN_LETTERS}])`);
}
const tests = [
  ['ابعاد دیر', true], ['بندر دیر فعال شد', true], ['مدیریت بحران آب', false],
  ['غدیر', false], ['پیام تبریک مدیر حوزه ها', false], ['سردار محسن رضایی', false],
  ['دیروز باران آمد', false], ['تالار دیر', true], ['مدیر کل تعزیرات', false],
  ['دیرین', false], ['مدیر حوزه', false], ['مذاکره با دیر', true],
];
let fail = 0;
for (const [s, expect] of tests) {
  const got = wordRegex('دیر').test(s);
  if (got !== expect) { fail++; console.log('FAIL:', s, 'got', got, 'want', expect); }
}
// تست چند کلیدواژه دیگر
const extra = [
  ['جم', 'شهر جم فعال شد', true],
  ['جم', 'مدیریت', false],
  ['جم', 'مذاکرات جم', true],
  ['اهرم', 'اهرم تنگستان', true],
  ['خارگ', 'جزیره خارگ', true],
  ['خارگ', 'خارک', false],
  ['برازجان', 'برازجان', true],
];
for (const [kw, s, expect] of extra) {
  const got = wordRegex(kw).test(s);
  if (got !== expect) { fail++; console.log('FAIL:', kw, 'in', s, 'got', got, 'want', expect); }
}
console.log(fail === 0 ? 'ALL TESTS PASSED' : fail + ' FAILURES');