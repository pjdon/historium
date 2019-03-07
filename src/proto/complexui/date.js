// (function () {
//   const msPerDay = 86400000;

//   Date.prototype.addMilliseconds = function (msValue) {
//     this.setTime(this.getTime() + msValue);
//     return this.getTime();
//   };

//   Date.prototype.addDay = function (dayValue) {
//     this.addMilliseconds(dayValue * msPerDay);
//     return this.getTime();
//   }

//   Date.prototype.localMsBounds = function () {
//     const localDateStart = (new Date(this.getFullYear(), this.getMonth(), this.getDate())).getTime();

//     return [localDateStart, localDateStart + msPerDay - 1];
//   }

// })();