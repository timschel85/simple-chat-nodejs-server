function retrieveRoomsList() {
    $('ul#rooms-list').empty()
    $.ajax({
        url:'/api/rooms',
        type:"GET",
        dataType:"json",
        timeout:5000,
        success:function(response) {
            if(response.length > 0) {
                $('ul#rooms-list').text("")
            }
            response.forEach(function(room) {
                $('ul#rooms-list')
                .prepend($('<li></li>')
                    .addClass('room-name')
                    .attr('id', room._id)
                    .on('click', function() {
                        // when you join a chat room
                        if($(this).hasClass('selected')) {
                            $('li.room-name').each(function() {
                                $(this).css('pointer-events','none')
                            })
                            myRoom = room
                            // console.log(myRoom)
                            $('span#room-name').text(room.name)
                            $('#chatroomCarousel').carousel('next')
                            socket.emit('joinRoom', $(this).attr('id'))
                        // when you select a chat room
                        } else {
                            $('li.room-name').each(function() {
                                $(this).removeClass('selected')
                            })
                            $(this).addClass('selected')
                        }
                    })
                    .append($('<div></div>')
                        .append($('<span></span>').addClass('room-name').text(room.name))
                        .append($('<span></span>').addClass('date').text(room.createAt))
                    )
                )
                // console.log($('li.room-name').attr('id'))
            }) // forEach
        }
    })
}


$(function () {
    retrieveRoomsList()

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
        $.ajax({
            url:'/api/rooms',
            type:'POST',
            dataType:'json',
            data: {name:$('input#created-room-name').val()},
            success:function(room, status) {
                $('input#created-room-name').val("")
                $('#createRoomModal').modal('hide')
                if(status==="success") {
                    $('ul#rooms-list')
                        .prepend($('<li></li>')
                        .addClass('room-name')
                        .attr('id', room._id)
                        .append($('<div></div>')
                        .append($('<span></span>').addClass('room-name').text(room.name))
                        .append($('<span></span>').addClass('date').text(room.createAt)))
                        .animate({backgroundColor:"#ffec42"}, 1000 , function() {
                            myRoom = room
                            console.log(myRoom)
                            $('span#room-name').text(room.name)
                            $('#chatroomCarousel').carousel('next')
                            socket.emit('joinRoom', $(this).attr('id'))
                        })
                    )
                }
            }
        })
    })
})