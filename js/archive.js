// Isotope filter buttons for the archive grid.
// Lifted out of js/main.js, which also drives the old homepage loader and
// sticky nav. Those elements don't exist here, so only the filter comes along.

$(document).ready(function () {
  let $btns = $('.project-area .button-group button');

  $btns.click(function (e) {
    $('.project-area .button-group button').removeClass('active');
    e.target.classList.add('active');

    let selector = $(e.target).attr('data-filter');
    $('.project-area .grid').isotope({
      filter: selector
    });
    return false;
  })

  $('.project-area .button-group #btn1').trigger('click');
});
