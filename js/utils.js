(function () {
  function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  window.appUtils = {
    isNonEmptyString
  };
})();
