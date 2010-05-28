/*jslint indent: 2, eqeqeq: false, plusplus: false, evil: true, onevar: false*/
/*global sinon, module, require*/
/**
 * Fake timer API
 * setTimeout
 * setInterval
 * clearTimeout
 * clearInterval
 * tick
 * reset
 * Date
 *
 * Partially inspired by jsUnitMockTimeOut from JsUnit
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * http://cjohansen.no/sinon/time/
 */
if (typeof sinon == "undefined") {
  this.sinon = {};
}

sinon.clock = (function () {
  var id = 0;

  function addTimer(args, recurring) {
    if (args.length === 0) {
      throw new Error("Function requires at least 1 parameter");
    }

    var toId = id++;
    var delay = args[1] || 0;

    if (!this.timeouts) {
      this.timeouts = {};
    }

    this.timeouts[toId] = {
      func: args[0],
      callAt: this.now + delay
    };

    if (recurring === true) {
      this.timeouts[toId].interval = delay;
    }

    return toId;
  }

  function createObject(object) {
    var object;

    if (Object.create) {
      object = Object.create(object);
    } else {
      var F = function () {};
      F.prototype = object;
      object = new F();
    }

    object.Date.clock = object;
    return object;
  }

  return {
    now: 0,

    create: function create(now) {
      var clock = createObject(this);

      if (typeof now == "number") {
        this.now = now;
      }

      return clock;
    },

    setTimeout: function setTimeout(callback, timeout) {
      return addTimer.call(this, arguments, false);
    },

    clearTimeout: function clearTimeout(id) {
      if (!this.timeouts) {
        this.timeouts = [];
      }

      delete this.timeouts[id];
    },

    setInterval: function setInterval(callback, timeout) {
      return addTimer.call(this, arguments, true);
    },

    clearInterval: function clearInterval(id) {
      this.clearTimeout(id);
    },

    tick: function tick(ms) {
      var found, timer, prop;

      while (this.timeouts && found !== 0) {
        found = 0;

        for (prop in this.timeouts) {
          if (this.timeouts.hasOwnProperty(prop)) {
            timer = this.timeouts[prop];

            if (timer.callAt >= this.now && timer.callAt <= this.now + ms) {
              try {
                if (typeof timer.func == "function") {
                  timer.func.call(null);
                } else {
                  eval(timer.func);
                }
              } catch (e) {}

              if (typeof timer.interval == "number") {
                found += 1;
                timer.callAt += timer.interval;
              } else {
                delete this.timeouts[prop];
              }
            }
          }
        }
      }

      this.now += ms;
    },

    reset: function reset() {
      this.timeouts = {};
    },

    Date: (function () {
      var NativeDate = Date;

      function ClockDate() {
        return new NativeDate(ClockDate.clock.now);
      }

      return ClockDate;
    }())
  };
}());

if (typeof module == "object" && typeof require == "function") {
  module.exports = sinon;
}