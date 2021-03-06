/*global webshim $ wl MobileDetect*/

$(function () {

    var body = $("body");
    var thanksLocation = "thanks.html";
    var wlLand = false;
    var name;

    function moveEl(elClass, containerClass) {

        if (document.querySelector(elClass)) {
            var el = document.querySelector(elClass);
            var container = document.querySelector(containerClass);

            container.appendChild(el);
        }
    }

    function sec2MoveImg() {

        if (window.matchMedia("(max-width:1024px)").matches) {
            moveEl(".sec2__img", ".sec2__list-wrap");
        } else {
            moveEl(".sec2__img", ".sec2");
        }
    }

    sec2MoveImg();

    function sec5MoveBtn() {

        if (window.matchMedia("(max-width: 768px)").matches) {
            moveEl(".sec5__btn", ".sec5__col_border");
        } else {
            moveEl(".sec5__btn", ".sec5__border");
        }
    }

    sec5MoveBtn();

    function sec9Move() {

        if (window.matchMedia("(max-width: 1024px)").matches) {
            moveEl(".sec9__img", ".sec9__content");
            moveEl(".sec9__text", ".sec9__container");
        } else {
            moveEl(".sec9__img", ".sec9__bottom");
            moveEl(".sec9__text", ".sec9__content");
        }
    }

    sec9Move();

    window.addEventListener("resize", function () {
        sec2MoveImg();
        sec5MoveBtn();
        sec9Move();
    });

    if ($('input[type="range"]').length) {
        $('input[type="range"]').rangeslider({
            polyfill: false
        });
    }

    webshim.setOptions('forms', {
        lazyCustomMessages: true,
        replaceValidationUI: true
    });
    webshim.polyfill('forms');

    function phoneLink() {
        var md = new MobileDetect(window.navigator.userAgent);
        var phoneLink = $("[data-phone]");

        if (md.mobile()) {
            phoneLink.attr("href", "tel:" + $(".phone-link").data("phone"));
            phoneLink.removeClass("js-small-btn");
        } else {
            phoneLink.attr("href", "");
            phoneLink.addClass("js-small-btn");
        }
    }
    phoneLink();

    // form handler

    $("input[name=phone]").inputmask({
        "mask": "+9 999 999-9999",
        greedy: false,
        clearIncomplete: true,
        "oncomplete": function () {
            $(this).addClass("input_success");
        },
        onKeyDown: function (event, buffer, caretPos, opts) {

            if (buffer[buffer.length - 1] === "_") {
                $(this).removeClass("input_success");
            } else {
                $(this).addClass("input_success");
            }
        }
    });

    body.on("click", ".js-small-btn", function (e) {
        e.preventDefault();

        if (!$(".thanks").length) {
            $("html").addClass("form-open");
            $(".form-wrap_small").addClass("form-wrap_open");
        }
    });

    body.on("click", function (e) {
        var self = $(e.target);

        if (self.hasClass("form-wrap") || self.hasClass("form__close")) {
            $("html").removeClass("form-open");
            $(".form-wrap").removeClass("form-wrap_open");
        }
    });

    if (typeof wl != "undefined") {
        wlLand = true;

        wl.callbacks.onFormSubmit = function ($form, res) {
            if ($form.data('next')) {

                if (res.status == 200) {
                    smallFormHandler($form);
                } else {
                    wl.callbacks.def.onFormSubmit($form, res);
                }
            } else {
                bigFormHandler($form);
            }
        };
    } else {
        wlLand = false;

        $("#smallForm, #bottomForm").submit(function (e) {
            e.preventDefault();
            var self = $(this);

            smallFormHandler(self);
        });

        $("#bigForm").submit(function (e) {
            e.preventDefault();
            var self = $(this);

            bigFormHandler(self);
        });
    }

    function formAction() {
        var smallFormWrap = document.querySelector(".form-wrap_small");
        var bigFormWrap = document.querySelector(".form-wrap_big");

        return {

            openSmallForm: function () {
                document.documentElement.classList.add("form-open");
                smallFormWrap.classList.add("form-wrap_open");
            },

            openBigForm: function (callback) {
                document.documentElement.classList.add("form-open");
                bigFormWrap.classList.add("form-wrap_open");
                callback();
            },

            closeSmallForm: function () {
                document.documentElement.classList.remove("form-open");
                smallFormWrap.classList.remove("form-wrap_open");
            },

            closeBigForm: function () {
                document.documentElement.classList.remove("form-open");
                bigFormWrap.classList.remove("form-wrap_open");
            },

            setInputValues: function () {
                var userInfo;

                if (localStorage.getItem("landUserInfo")) {
                    userInfo = JSON.parse(localStorage.getItem("landUserInfo"));
                }

                $("[name=name1]").val(userInfo.name);
                $("[name=phone1]").val(userInfo.phone);
                $("[name=email1]").val(userInfo.email);

                if (userInfo.city !== "") {
                    $("[name=city]").val(userInfo.city);
                }
            }
        };
    }

    function setInputTitle() {
        var titleVal = document.querySelector("title").innerText;
        var forms = document.querySelectorAll("form");
        var inputTitles;

        for (var i = 0; i < forms.length; i++) {
            var form = forms[i];
            form.insertBefore(createInputEl(), form.firstElementChild);
        }

        inputTitles = document.querySelectorAll(".js-hidden-title");

        for (var j = 0; j < inputTitles.length; j++) {
            var input = inputTitles[j];
            input.value = titleVal;
        }

        function createInputEl() {
            var input = document.createElement("input");
            input.classList.add("js-hidden-title");
            input.name = "title";
            input.type = "hidden";

            return input;
        }
    }
    setInputTitle();

    function smallFormHandler(form) {

        var selfName = form.find("input[name=name]");
        var selfPhone = form.find("input[name=phone]");
        var selfEmail = form.find("input[name=email]");
        var selfCity = form.find("input[name=city]");
        var formData = form.serialize();

        var landUserInfo = {
            "name": selfName.val(),
            "phone": selfPhone.val(),
            "email": selfEmail.val(),
            "city": selfCity.val()
        };

        localStorage.setItem("landUserInfo", JSON.stringify(landUserInfo));

        name = selfName.val();

        $.ajax({
            type: "POST",
            url: "php/send.php",
            data: formData,
            success: function () {
                window.location = thanksLocation;
            }
        });

        if (name) {
            localStorage.setItem("landclientname", name + ", наши");
        } else {
            localStorage.setItem("landclientname", "Наши");
        }
    }

    function bigFormHandler(form) {
        var formData;
        formData = form.serialize();

        $.ajax({
            type: "POST",
            url: "php/sendpresent.php",
            data: formData,
            success: function () {
                formAction().closeBigForm();
            }
        });
    }

    function thanksPageHandler() {

        if (isThanksPage()) {
            formAction().openBigForm(formAction().setInputValues);
            $("#thanksName").text(localStorage.getItem("landclientname"));
        }

        function isThanksPage() {

            if (document.querySelector(".thanks")) {
                return true;
            } else {
                return false;
            }
        }
    }
    thanksPageHandler();
});
//# sourceMappingURL=app.js.map
