module.exports = {
  required: function(key, value) {
    if(value && value.toString().length > 0) {
      return {
        status: true
      };
    }

    return {
      status: false,
      error: `${key} field is required.`
    };
  },

  min: function(key, value, prop) {
    if(value === "" || value.toString().length >= prop) {
      return {
        status: true
      };
    }

    return {
      status: false,
      error: `${key} field must have at least ${prop} characters.`
    };
  },

  max: function(key, value, prop) {
    if(value === "" || value.toString().length <= prop) {
      return {
        status: true
      };
    }

    return {
      status: false,
      error: `${key} field must have maximum of ${prop} characters.`
    };
  },

  integer: function(key, value) {
    if(value === "" || ((!isNaN(value) && value.toString().indexOf('.') === -1) && (!isNaN(value) && !isNaN(parseInt(value))))) {
      return {
        status: true
      };
    }

    return {
      status: false,
      error: `${key} field must be integer.`
    };
  },

  float: function(key, value) {
    if(value === "" || (!isNaN(value) && value.toString().indexOf('.') != -1)) {
      return {
        status: true
      };
    }

    return {
      status: false,
      error: `${key} field must be float.`
    };
  },

  numeric: function(key, value) {
    if(value === "" || (!isNaN(value) && value.toString().indexOf('.') != -1) || (!isNaN(value) && !isNaN(parseInt(value)))) {
      return {
        status: true
      };
    }

    return {
      status: false,
      error: `${key} field must be numeric.`
    };
  },

  between: function(key, value, prop) {
    const props = prop.split(",")

    if(props.length > 1) {
      const isNumeric = this.numeric(key, value)

      if(isNumeric.status) {
        if(value === "" || (parseFloat(value) >= props[0] && parseFloat(value) <= props[1])) {
          return {
            status: true
          };
        }
      }else {
        return isNumeric
      }

      return {
        status: false,
        error: `${key} field must be between ${props[0]} and ${props[1]}.`
      };
    } else {
      return {
        status: false,
        error: `Validation rules error on mock api, please check your rules on request.`
      };
    }
  },
}
