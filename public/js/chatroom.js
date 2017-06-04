

$.fn.selectRange = function(start, end) {
    console.log("selectRange()")
    return this.each(function() {
        if (this.setSelectionRange) {
            this.focus();
            this.setSelectionRange(start, end);
        } else if (this.createTextRange) {
            var range = this.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        }
    });
};

$(function () {

    $('button#back-to-lobby').on('click', function(){
        // slide to lobby page
        $('#chatroomCarousel').carousel('prev')
        // make rooms list clickable
        $('li.room-name').each(function() {
            $(this).css('pointer-events','auto')
        })
    })

    $('form#message-form').on('submit', function (e) {
        e.preventDefault()
        var m = $('input#m')
        socket.emit('fromClient', 
        {
            roomId:roomId,
            nickname:nickname,
            message:m.val()
        })
        m.val('')
        m.focus()
    })
    // message from myself
    socket.on('toClient toMyself', function (data) {
        $('div#message-list')
            .append($('<div class="my-message-box"></div>')
            .append($('<span>time</span>'))
            .append($('<span class="my-message"></span>').text(data.message)))
            .animate({
                scrollTop: $('div#message-list').get(0).scrollHeight
        }, 500)
    })
    // message from friends
    socket.on('toClient toFriends', function (data) {
        $('div#message-list')
            .append($('<div></div>').addClass("friends-data-box")
                .append($('<img/>').attr('src', profileImage).addClass('img-circle'))
                .append($('<div></div>').addClass("friends-message-box")
                    .append($('<p class="friends-name"></p>').text(data.nickname))
                    .append($('<span class="friends-message"></span>').text(data.message))
                    .append($('<span>time</span>'))
                )
            )
            .animate({
                scrollTop: $('div#message-list').get(0).scrollHeight
        }, 500)
    })
    // add  new comer's nickname to the friends list
    socket.on('freindsList', function(data) {
        var mySocketIdIndex = data.id.indexOf(socket.id)
        nickname = data.nickname[mySocketIdIndex];
        console.log(nickname)
        $('ul#friend-list').empty()
        data.nickname.forEach(function(nickname, index) {
            if(index===mySocketIdIndex) {
                $('ul#friend-list').append($('<div class="dropdown"></div>'))
                $('ul#friend-list > div.dropdown')
                    .append($('<li id="my-nickname-menu" class="dropdown-toggle" data-toggle="dropdown"></li>')
                      .text(nickname+"(me)").css('font-weight', 'bold'))

                $('ul#friend-list > div.dropdown')
                .append($('<ul class="dropdown-menu" role="menu" aria-labelledby="my-nickname-menu"><li id="change-my-nickname" role="presentation"><a role="menuitem" tabindex="-1">Change my nickname</a></li></ul></div>'))
                $('#my-nickname-menu').dropdown()

                // change my nick name
                $('li#change-my-nickname').on('click', function() {
                    $('#changeNicknameModal').appendTo("body").modal('show');
                })
            }
            else
                $('ul#friend-list').append($('<li></li>').text(nickname))                           
        })
    })

    // after my-nickname modal shown
    $('#changeNicknameModal').on('shown.bs.modal', function() {
        $('input#my-nickname').val(nickname).focus().selectRange(0,nickname.length)
    })

    $('form#change-my-nickname-form').on('submit', function(e) {
        e.preventDefault()
        nickname = $('input#my-nickname').val();
        socket.emit('changeNickname', nickname)
        $('#changeNicknameModal').modal('toggle')
    })

})