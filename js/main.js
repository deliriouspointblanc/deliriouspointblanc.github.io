$(document).ready(function(){
  let $btns = $('.project-area .button-group button');

  $btns.click(function(e){
    $('.project-area .button-group button').removeClass('active');
    e.target.classList.add('active');

    let selector = $(e.target).attr('data-filter');
    $('.project-area .grid').isotope({
      filter:selector
    });
    return false;
  })

  // $('.collapse').collapse()

  $('.project-area .button-group #btn1').trigger('click');
  //sticky nav menu

  let nav_offset_top = $('.head_area').height() + 50;

  function navbarFixed(){
    if($('.header_area').length){
      $(window).scroll(function(){
        let scroll = $(window).scrollTop();
        if(scroll >= nav_offset_top){
          $('.head_area .main-menu').addClass('navbar_fixed');
        }else {
          $('.head_area .main-menu').removeClass('navbar_fixed');
        }
      })
    }
  }

  navbarFixed();

  // /*https://www.geeksforgeeks.org/how-to-make-a-div-stick-to-the-top-of-the-screen/ *
  stickyElem = document.querySelector(".sticky-div");
     
    /* Gets the amount of height
    of the element from the
    viewport and adds the
    pageYOffset to get the height
    relative to the page */
    currStickyPos = stickyElem.getBoundingClientRect().top + window.pageYOffset;
    window.onscroll = function() {
         
        /* Check if the current Y offset
        is greater than the position of
        the element */
        if(window.pageYOffset > currStickyPos) {
            stickyElem.style.position = "fixed";
            stickyElem.style.top = "0px";
        } else {
            stickyElem.style.position = "relative";
            stickyElem.style.top = "initial";
        }
    }
});

