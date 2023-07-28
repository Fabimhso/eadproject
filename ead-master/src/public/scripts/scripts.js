$("#adminCPF").mask("000.000.000-00");
$("#tel").mask("(00) 00000-0000");

var state = "hidden";
$("#showPasswd").click(() => {
  if (state == "hidden") {
    $("#showPasswd i").removeClass("fa-eye").addClass("fa-eye-slash");
    $("#adminPassword").prop("type", "text");
    state = "nothidden";
  } else if (state == "nothidden") {
    $("#showPasswd i").removeClass("fa-eye-slash").addClass("fa-eye");
    $("#adminPassword").prop("type", "password");
    state = "hidden";
  }
});

var menuState = "hidden";
$(".showmenu").click(() => {
  if (menuState == "hidden") {
    $(".sub-menu").slideToggle(170);
    $(".showmenu i").removeClass("fa-angle-down").addClass("fa-angle-up");
    menuState = "nothidden";
  } else if (menuState == "nothidden") {
    $(".sub-menu").slideToggle(170);
    $(".showmenu i").removeClass("fa-angle-up").addClass("fa-angle-down");
    menuState = "hidden";
  }
});

var mobileMenuState = "hidden";
$(".mobile i").click(() => {
  if (mobileMenuState == "hidden") {
    $(".mobile ul").slideToggle(170);
    $(".mobile i").removeClass("fa-bars").addClass("fa-times");
    mobileMenuState = "nothidden";
  } else if (mobileMenuState == "nothidden") {
    $(".mobile ul").slideToggle(170);
    $(".mobile i").removeClass("fa-times").addClass("fa-bars");
    mobileMenuState = "hidden";
  }
});

var buttons = document.querySelectorAll(".price");
buttons.forEach(function (button) {
  button.onclick = function() {
    var modal = button.getAttribute("data-modal");
    $("#overlay").css("display", "block");
    $(`#${modal}`).css("display", "block");
    $("body").eq(0).css("overflow", "hidden");

    var cur_slide = 0;
    var max_slide = $(`.${modal}`).length - 1;
    var delay = 3;

    init_slider = () => {
      $(`.${modal}`).hide();
      $(`.${modal}`).eq(0).show();
      if ($(`.${modal}`).length > 1) {
        let content = $(`#${modal} .bullets`).html();
        content = "";
        $(`#${modal} .bullets`).html(content);
        for (let i = 0; i < max_slide + 1; i++) {
          if (i == 0)
            content += "<span class=\"active-slide\"></span>";
          else
            content += "<span></span>";

          $(`#${modal} .bullets`).html(content);
        }
      }
    }

    change_slide = () => {
      setInterval(() => {
        $(`.${modal}`).eq(cur_slide).stop().fadeOut(1500);
        cur_slide++;
        if (cur_slide > max_slide)
          cur_slide = 0;
        $(`.${modal}`).eq(cur_slide).stop().fadeIn(1500);

        $(`#${modal} .bullets span`).removeClass("active-slide");
        $(`#${modal} .bullets span`).eq(cur_slide).addClass("active-slide");
      }, delay * 1000);
    }

    $("body").on("click", `#${modal} .bullets span`, function () {
      var cur_bullet = $(this);
      $(`.${modal}`).eq(cur_slide).stop().fadeOut(1000);
      cur_slide = cur_bullet.index();
      $(`.${modal}`).eq(cur_slide).stop().fadeIn(1000);
      $(`#${modal} .bullets span`).removeClass("active-slide");
      cur_bullet.addClass("active-slide");
    });

    init_slider();
    change_slide();
  };
}); 

var closeButtons = document.querySelectorAll(".close");
closeButtons.forEach(function (button) {
  button.onclick = function() {
    var modal = (button.closest(".treinamento-modal").style.display = "none");
    $("#overlay").css("display", "none");
    $("body").css("overflow", "auto");
    let content = $(`#${modal} .bullets`).html();
    content = "";
    $(`#${modal} .bullets`).html(content);
  };
});
