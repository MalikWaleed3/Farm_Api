const fs = require('fs');

const readFile = (path, callback)  => {
    fs.readFile(path, (err, data) => {
      if (err) {
        return callback && callback(err);
      }
      try {
        const object = JSON.parse(data);
        return callback && callback(null, object);
      } catch (err) {
        return callback && callback(err);
      }
    });
  }

  module.exports = {readFile};