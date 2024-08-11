import {_decorator, Component, math, resources, Sprite, SpriteFrame, tween} from 'cc';

const {ccclass, property} = _decorator;

@ccclass('card')
export class Card extends Component {
    @property(Sprite)
    back: Sprite = null;

    @property(Sprite)
    face: Sprite = null;

    _cardPoint: number = 0;
    _flipUnit: number = 1;

    flipShow(point: number, delayTime?: number, callback?: Function) {
        this._cardPoint = point;

        delayTime = delayTime ?? 0;

        tween(this.node)
            .delay(delayTime)
            .to(this._flipUnit, {
                eulerAngles: new math.Vec3(0, 90, 0)
            })
            .call(function () {
                this.face.node.active = true;
                this.back.node.active = false;
                // this.loadCardFaceImage();
            }.bind(this))
            .to(this._flipUnit, {
                eulerAngles: new math.Vec3(0, 0, 0)
            })
            .call(function () {
                if (callback) {
                    callback();
                }
            })
            .start();
    }

    start() {

    }

    loadCardFaceImage() {
        resources.load("cards/CardFace", SpriteFrame, (err, spriteFrame) => {
            this.face.spriteFrame = spriteFrame;
        });
    }
}
