/* eslint camelcase: 0 */

const DEFAULT_ROWS = 20;

export default function getData(ROWS) {
  ROWS = ROWS || DEFAULT_ROWS;

  // generate some dummy data
  const data = {
    start_at: new Date().getTime() / 1000,
    databases: []
  };

  for (let i = 1; i <= ROWS; i++) {

    data.databases.push({
      id: `cluster${i}`,
      queries: []
    });

    data.databases.push({
      id: `cluster${i}slave`,
      queries: []
    });

  }

  data.databases.forEach(function(info) {
    const r = Math.floor((Math.random() * 10) + 1);

    for (let i = 0; i < r; i++) {
      const q = {
        canvas_action: null,
        canvas_context_id: null,
        canvas_controller: null,
        canvas_hostname: null,
        canvas_job_tag: null,
        canvas_pid: null,
        elapsed: Math.random() * 15,
        query: 'SELECT blah FROM something',
        waiting: Math.random() < 0.5
      };

      if (Math.random() < 0.2) {
        q.query = '<IDLE> in transaction';
      }

      if (Math.random() < 0.1) {
        q.query = 'vacuum';
      }

      info.queries.push(q);
    }

    info.queries = info.queries.sort(function(a, b) {
      return b.elapsed - a.elapsed;
    });
  });

  return data;
}
