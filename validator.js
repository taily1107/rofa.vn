// Đối tượng validator
function Validator(options) {

  function getParent(element, selector) {
    while(element.parentElement) {
      if (element.parentElement.matches(selector)){
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  var selectorRules = {};
  // ham thuc hien validate
  function validate(inputElement, rule) {
    var errorMessage;
    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(
      options.errorSelector
    );
    //lay ra cac rule cua selecter
    var rules = selectorRules[rule.selector];

    // lap qua tung rule va kiem tra
    // neu co loi dung viec kiem tra
    for (var i = 0; i < rules.length; ++i) {
      switch (inputElement.type) {
        case 'radio':
        case 'checkbox':
          errorMessage = rules[i](
            formElement.querySelector(rule.selector + ':checked')
          );
          break;
        default:
          errorMessage = rules[i](inputElement.value);
      }
      
      if (errorMessage) break;
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      getParent(inputElement, options.formGroupSelector).classList.add("invalid");
    } else {
      errorElement.innerText = "";
      getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
    }

    return !errorMessage;
  }

  // lay element cua form can validate
  var formElement = document.querySelector(options.form);
  if (formElement) {
    // tat submit theo hanh vi mac dinh
    formElement.onsubmit = function (e) {
      e.preventDefault();

      var isFormValid = true;

      //lap qua tung rule va validate luon
      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);
        var isValid = validate(inputElement, rule);

        if (!isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        //truong hop submit vs js
        if (typeof options.onSubmit === "function") {
          var enableInputs = formElement.querySelectorAll("[name]");
          var formValues = Array.from(enableInputs).reduce((values, input) => {
              switch(input.type){
                case 'radio':
                  values[input.name] = formElement.querySelector(`input[name="${input.name}"]:checked`).value;
                break;
                case 'checkbox':
                  if (!input.matches(':checked')) {
                    values[input.name] = '';
                    return values;
                  };

                  if (!Array.isArray(values[input.name])) {
                    values[input.name] = [];
                  }

                  values[input.name].push(input.name);
                break;
                case 'file':
                    values[input.name] = input.files;
                  break;
              default:
                values[input.name] = input.value;
              }
              return values;
          }, {});
          options.onSubmit(formValues);
        }
        //truong hop submit voi hanh vi mac dinh
        else {
          formElement.onsubmit();
        }
      }
    };

    // lap qua moi rule va xu ly(lang nghe blur, input,...)
    options.rules.forEach(function (rule) {
      //luu lai cac rule cho moi input
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      var inputElements = formElement.querySelectorAll(rule.selector);
      Array.from(inputElements).forEach((inputElement) => {
          // xu ly truong hop khi blur ra khoi input
          inputElement.onblur = function () {
            validate(inputElement, rule);
          };

          // xu ly khi nguoi dung nhap vao input
          inputElement.oninput = () => {
            var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(
              options.errorSelector
            );
            errorElement.innerText = "";
            getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
          };
        });
    });
  }
}

// Định nghĩa các rules
// nguyen tac cua cac rule:
// 1. khi co loi thi tra ra message loi
// 2. khi khong co loi khong tra ra gi ca (undefined)
Validator.isRequired = (selector, message) => ({
  selector: selector,
  test: (value) => value ? undefined : message || "vui long nhap truong nay",
});

Validator.isEmail = (selector, message) => ({
  selector: selector,
  test: function (value) {
    var regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    return regex.test(value)
      ? undefined
      : message || "truong nay phai la email";
  },
});

Validator.isPassWord = (selector, min, message) => ({
  selector: selector,
  test: (value) => value.length >= min
    ? undefined
    : message || `vui long nhap toi thieu ${min} ky tu`,
});

Validator.isConfirmed = (selector, getConfirmValue, message) => ({
  selector: selector,
  test: function (value) {
    return value === getConfirmValue()
      ? undefined
      : message || "gia tri nhap vao khong chinh xac";
  },
});
