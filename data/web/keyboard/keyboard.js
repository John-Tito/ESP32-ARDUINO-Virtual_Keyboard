//* keyboard.js


var ws;
// document.getElementById('BTN_1').addEventListener('click', button_1_pressed);
// document.getElementById('BTN_2').addEventListener('click', button_2_pressed);
function init() {
    if ('' != window.location.hostname) {
        ws = new WebSocket('ws://' + window.location.hostname + '/ws');
        ws.onopen = function (evt) {
            console.log('Connection open ...');
            ws.send('Hello WebSockets!');
        };

        ws.onclose = function (evt) {
            console.log('Connection closed.');
        };

        ws.onmessage = function (event) {
            processCommand(event);
        };
    }
}
function processCommand(event) {
    console.log(event.data);
    // var obj = JSON.parse(event.data);
    // document.getElementById('message').innerHTML = obj.PIN_Status;
    // document.getElementById('temp').innerHTML = obj.Temp;
    // document.getElementById('hum').innerHTML = obj.Hum;
    // console.log(obj.PIN_Status);
    // console.log(obj.Temp);
    // console.log(obj.Hum);
}
// function button_1_pressed() {
//     ws.send('1');
// }
// function button_2_pressed() {
//     ws.send('0');
// }
init();


var keyboard = (function () {
    var keyboardObj = document.getElementById('keyboard'), _inputID, _shiftStatus = false, _capsLock = false;

    // 获取输入框的内容
    var _getInputContent = function () {
        var inputContent = document.getElementById(_inputID).innerText || document.getElementById(_inputID).textContent;
        return inputContent;
    }
    // 输入新内容
    var _inputNewContent = function (str) {
        document.getElementById(_inputID).innerHTML = str;
    }

    // 添加classname
    function _addClass(obj, cls) {
        var obj_class = obj.className,
            blank = obj_class != '' ? ' ' : '';
        var added = obj_class + blank + cls;
        obj.className = added;

    }
    // 删除classname
    function _removeClass(obj, cls) {
        var obj_class = ' ' + obj.className + ' ';
        obj_class = obj_class.replace(/(\s+)/gi, ' ');
        var removed = obj_class.replace(' ' + cls + ' ', ' ');
        removed = removed.replace(/(^\s+)|(\s+$)/g, '');
        obj.className = removed;
    }
    // 为按钮添加active
    function _addActive(cls, keycode) {
        var keys_a = document.getElementsByClassName(cls);
        for (var o of keys_a) {
            if (o.getAttribute('data-kid') == keycode) {
                _addClass(o, 'active');
            }
        }
    }
    // 为按钮取消active
    function _removeActive(cls, keycode) {
        var keys_a = document.getElementsByClassName(cls);
        for (var o of keys_a) {
            if (o.getAttribute('data-kid') == keycode) {
                _removeClass(o, 'active');
            }
        }
    }

    // 添加shift状态
    var _addShift = function () {
        _addActive('keys_c', 16);
        return _shiftStatus = true;
    }
    // 取消shift状态
    var _removeShift = function () {
        _removeActive('keys_c', 16);
        return _shiftStatus = false;
    }

    // 添加CapsLock状态
    var _addCapsLock = function () {
        _addActive('keys_c', 20);
        return _capsLock = true;
    }
    // 取消CapsLock状态
    var _removeCapsLock = function () {
        _removeActive('keys_c', 20);
        return _capsLock = false;
    }

    // 给按钮绑定触发键盘事件的事件
    var _bindEvent = function () {
        var keys_a = keyboardObj.getElementsByClassName('keys_a');
        var keys_d = document.getElementsByClassName('keys_d');
        var keys_c = document.getElementsByClassName('keys_c');

        // 字母按键
        for (var o of keys_a) {
            o.onclick = function () {
                var strArr = _getInputContent().split('');
                var keyCode = this.getAttribute('data-kid');
                console.log(keyCode);
                if (_shiftStatus) {
                    _capsLock = !_capsLock;
                    _capsLock ? strArr.push(this.innerHTML.toUpperCase()) : strArr.push(this.innerHTML.toLowerCase());
                    _capsLock = !_capsLock;
                    _removeShift();
                }
                else {
                    _capsLock ? strArr.push(this.innerHTML.toUpperCase()) : strArr.push(this.innerHTML.toLowerCase());
                }
                _inputNewContent(strArr.join(''));
            }
        }
        // 数字及特殊符号按键
        for (var o of keys_d) {
            o.onclick = function () {
                var strArr = _getInputContent().split('');
                var keyCode = this.getAttribute('data-kid');
                console.log(keyCode);
                var key1 = this.getElementsByTagName('div')[0].innerHTML;
                var key2 = this.getElementsByTagName('div')[1].innerHTML;
                if (_shiftStatus) {
                    strArr.push(key1);
                    _removeShift();
                } else { strArr.push(key2); }
                _inputNewContent(strArr.join(''));
            }
        }

        // shift、capslock、enter、tab、backspace 按钮
        for (var o of keys_c) {
            o.onclick = function () {
                var strArr = _getInputContent().split('');
                var keyCode = this.getAttribute('data-kid');
                console.log(keyCode);
                if (keyCode == 8) {
                    strArr.pop();
                    _inputNewContent(strArr.join(''));
                } else if (keyCode == 9) {
                    strArr.push('&nbsp;&nbsp;');
                    _inputNewContent(strArr.join(''));
                } else if (keyCode == 13) {
                    strArr.push('\n');
                    _inputNewContent(strArr.join(''));
                } else if (keyCode == 16) {
                    if (!_shiftStatus) { _addShift(); } else { _removeShift(); }
                } else if (keyCode == 20) {
                    if (!_capsLock) { _addCapsLock(); } else { _removeCapsLock(); }
                }
            }
        }

        if ((ws != null)) {
            for (var o of keys_c) {
                o.addEventListener("click", function () {
                    var keyCode = parseInt(this.getAttribute("data-kid"));
                    var msg = JSON.stringify({
                        type: "key",
                        content: keyCode
                    });
                    ws.send(msg);
                });
            }
            for (var o of keys_a) {
                o.addEventListener("click", function () {
                    var keyCode = parseInt(this.getAttribute("data-kid"));
                    var msg = JSON.stringify({
                        type: "key",
                        content: keyCode
                    });
                    ws.send(msg);
                });
            }
            for (var o of keys_d) {
                o.addEventListener("click", function () {
                    var keyCode = parseInt(this.getAttribute("data-kid"));
                    var msg = JSON.stringify({
                        type: "key",
                        content: keyCode
                    });
                    ws.send(msg);
                });
            }
        }
    }

    var keyboard = function () { }

    // 输入框绑定键盘
    keyboard.prototype.addKeyboard = function (id) {
        _inputID = id
        var inputObj = document.getElementById(id);
        _bindEvent();
    }

    return keyboard;
})()
// ————————————————
// 版权声明：本文为CSDN博主「KeyonY」的原创文章，遵循CC 4.0 BY - SA版权协议，转载请附上原文出处链接及本声明。
// 原文链接：https://blog.csdn.net/u010467784/article/details/78286641