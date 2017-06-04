var randomRoomId = 0;

$(function () {
    // when you click room's name
    $('li.room-name').on('click', function() {
        if($(this).hasClass('selected')) {
            $('li.room-name').each(function() {
                $(this).css('pointer-events','none')
            })
            $('#chatroomCarousel').carousel('next')
            roomId = $(this).val();
            socket.emit('joinRoom', roomId)
        } else {
            $('li.room-name').each(function() {
                $(this).removeClass('selected')
            })
            $(this).addClass('selected')
        }
    })

    // when you want to create a chat room
    $('#create-room').on('click', function() {
        $('#createRoomModal').appendTo("body").modal('show')
        setTimeout(function() {
            $('input#created-room-name').focus()
        }, 300)
    })

    // when you submit new room's name
    $('form#create-room-form').on('submit', function(e) {
        e.preventDefault()
        if(randomRoomId===0) {
            $('ul#rooms-list').empty()
        }

        $('ul#rooms-list')
            .prepend($('<li></li>')
                .addClass('room-name')
                .val(randomRoomId)
                .text($('input#created-room-name').val())
                .on('click', function(){
                    if($(this).hasClass('selected')) {
                        $('li.room-name').each(function() {
                             $(this).css('pointer-events','none')
                        })
                        $('#chatroomCarousel').carousel('next')
                        roomId = $(this).val();
                        socket.emit('joinRoom', roomId)
                    } else {
                        $('li.room-name').each(function() {
                        $(this).removeClass('selected')
                    })
                    $(this).addClass('selected')
                }
            }))
        randomRoomId++
        $('input#created-room-name').val("")
        $('#createRoomModal').modal('hide')
    })
})