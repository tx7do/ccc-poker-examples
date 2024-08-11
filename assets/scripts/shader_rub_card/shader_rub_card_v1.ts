import {
    _decorator, Component, Node, DynamicAtlasManager,
    Material, Sprite, UITransform, Vec2, EventTouch, Rect,
    Vec3, tween, Button, Tween
} from 'cc';

const {ccclass, property} = _decorator;

@ccclass('DrawCardV1')
export class DrawCardV1 extends Component {

    _backMaterialNode !: Node;
    _frontMaterialNode !: Node;
    _backMaterial !: Material;
    _frontMaterial !: Material;
    _initBox: any;
    _box: any;
    _touchLayer !: Node;
    _button !: Node;

    upPos: Vec2 = new Vec2();
    initPos: any;
    movePos: any;
    rectHor: Rect = new Rect(372.5, 170, 215, 300);
    rectVer: Rect = new Rect(330, 212.5, 300, 215);

    start() {
        DynamicAtlasManager.instance.enabled = false;
        this._backMaterialNode = this.node.getChildByName("cardBg")!;
        this._frontMaterialNode = this._backMaterialNode.getChildByName("cardNum")!;
        this._backMaterial = this._backMaterialNode.getComponent(Sprite)!.getSharedMaterial(0)!;
        this._frontMaterial = this._frontMaterialNode.getComponent(Sprite)!.getSharedMaterial(0)!;
        this._initBox = this._backMaterialNode.getComponent(UITransform)!.getBoundingBoxToWorld();
        this._box = this._backMaterialNode.getComponent(UITransform)!.getBoundingBoxToWorld();

        this._frontMaterial.setProperty('worldPos', new Vec2(this._box.x, this._box.y));
        this._backMaterial.setProperty('sprWidth', this._box.width);
        this._backMaterial.setProperty('sprHeight', this._box.height);
        this._frontMaterial.setProperty('sprWidth', this._box.width);
        this._frontMaterial.setProperty('sprHeight', this._box.height);

        this._touchLayer = this.node.getChildByName("touchLayer")!;
        this._button = this.node.getChildByName("button")!;

        let self = this;
        // 注册监听
        const touchBegan = function (evt: EventTouch) {
            self.upPos = evt.getUILocation();
        };
        const touchMove = function (evt: EventTouch) {
            evt.propagationStopped = true;
            const pos = evt.getUILocation();
            const disRect = {
                x: self.upPos.x - self._box.x,
                y: self.upPos.y - self._box.y
            };

            if (self.initPos) {
                self.movePos = {
                    x: pos.x - self._box.x,
                    y: pos.y - self._box.y
                };
                self.setxy();
            } else {
                //必须从牌的旁边开始翻,中间不允许翻牌
                const ds = 30;
                const box = new Rect(self._box.x, self._box.y,
                    self._box.width, self._box.height);
                box.x = box.x + ds;
                box.y = box.y + ds;
                box.width = box.width - ds * 2;
                box.height = box.height - ds * 2;
                if (self._box.contains(pos) && !box.contains(self.upPos)) {
                    if (disRect.x <= ds) {
                        disRect.x = 0;
                    } else if (disRect.x >= self._box.width - ds) {
                        disRect.x = self._box.width;
                    }
                    if (disRect.y <= ds) {
                        disRect.y = 0;
                    } else if (disRect.y >= self._box.height - ds) {
                        disRect.y = self._box.height;
                    }
                    self.initPos = disRect;
                }
            }
            self.upPos = pos;

            console.log(self._box, self._initBox);
        };
        const touchEnded = function (evt: EventTouch) {
            evt.propagationStopped = true;
            self.initSetData();
            self.initPos = false;
        };
        const touchCancel = function (evt: EventTouch) {
            evt.propagationStopped = true;
            self.initSetData();
            self.initPos = false;
        };
        this._touchLayer.on(Node.EventType.TOUCH_START, touchBegan, this);
        this._touchLayer.on(Node.EventType.TOUCH_MOVE, touchMove, this);
        this._touchLayer.on(Node.EventType.TOUCH_END, touchEnded, this);
        this._touchLayer.on(Node.EventType.TOUCH_CANCEL, touchCancel, this);

        this._button.on(Button.EventType.CLICK, function () {
            Tween.stopAllByTarget(self._backMaterialNode);
            let _angle = self._backMaterialNode.angle;
            _angle -= 90;

            tween(self._backMaterialNode).sequence(
                tween().to(0.2, {angle: _angle}),
                tween().call(() => {
                    self._box = self._backMaterialNode.getComponent(UITransform)!.getBoundingBoxToWorld();
                    // 精度矫正
                    if (_angle == 0 || _angle == -180) {
                        self._box = self.rectHor;
                    } else if (_angle == -90 || _angle == -270) {
                        self._box = self.rectVer;
                    }
                    self._frontMaterial.setProperty('worldPos', new Vec2(self._box.x, self._box.y));
                    self.initSetData();
                })
                    .delay(0.3)
                    .call(() => {
                        // 角度处理
                        if (self._backMaterialNode.angle <= -360) {
                            _angle += 360;
                            self._backMaterialNode.angle = _angle;
                        }
                    })
            ).start();
        }, this);

        this.initSetData();
    }

    initSetData() {
        this._backMaterial.setProperty('disX', new Vec2());
        this._backMaterial.setProperty('disY', new Vec2());
        this._backMaterial.setProperty('xlist', new Vec3());
        this._backMaterial.setProperty('ylist', new Vec3());

        this._frontMaterial.setProperty('disX', new Vec2());
        this._frontMaterial.setProperty('disY', new Vec2());
        this._frontMaterial.setProperty('xlist', new Vec3());
        this._frontMaterial.setProperty('ylist', new Vec3());
        this._frontMaterial.setProperty('worldSprWidth', this._box.width);
        this._frontMaterial.setProperty('worldSprHeight', this._box.height);
        this._frontMaterial.setProperty('disXSymmetricPos', new Vec2());
        this._frontMaterial.setProperty('disYSymmetricPos', new Vec2());
        this._frontMaterial.setProperty('xlistSymmetricPos', new Vec3());
        this._frontMaterial.setProperty('ylistSymmetricPos', new Vec3());
    }

    getXYData(initPos: any, movePos: any, width: number, height: number) {
        const disX = movePos.x - initPos.x;
        const disY = movePos.y - initPos.y;
        const XYData = {
            disX: new Vec2(0, 0),
            disY: new Vec2(0, 0),
            xlist: new Vec3(0, 0, 0),
            ylist: new Vec3(0, 0, 0)
        };
        if (disY == 0) {
            let x1 = 0;
            let x2 = (initPos.x * 2 + disX) * 0.5;
            if (disX < 0) {
                x1 = (width - ((width - initPos.x) * 2 - disX) * 0.5);
                x2 = width;
            }
            XYData.disX = new Vec2(x1, x2);
        } else if (disX == 0) {
            let y1 = height - (initPos.y * 2 + disY) * 0.5;
            let y2 = height;
            if (disY < 0) {
                y1 = 0;
                y2 = ((height - initPos.y) * 2 - disY) * 0.5;
            }
            XYData.disY = new Vec2(y1, y2);
        } else {
            // 获取反正切值
            let tanValue = Math.atan(disY / disX);
            //获取斜边距离
            let disHy = Math.sqrt(disX * disX + disY * disY);
            //获取隐藏部分的y
            let hy = Math.abs((disHy * 0.5) / Math.sin(tanValue));
            //获取隐藏部分的x
            let hx = Math.abs((disHy * 0.5) / Math.cos(tanValue));

            let pos1 = new Vec2();
            let pos2 = new Vec2();
            let pos3 = new Vec2();
            if (disX > 0 && disY > 0) {          //往右上翻牌
                pos1.x = 0;
                pos1.y = height;
                if (initPos.x > initPos.y) {
                    pos2.x = hx + initPos.x;
                    pos2.y = height;
                    pos3.x = 0;
                    pos3.y = height - (((hx + initPos.x) / hx * (hy + initPos.y)));
                } else {
                    pos2.x = 0;
                    pos2.y = height - (hy + initPos.y);
                    pos3.x = (hy + initPos.y) / hy * (hx + initPos.x);
                    pos3.y = height;
                }
            } else if (disX < 0 && disY > 0) {    //往左上翻牌
                pos1.x = width;
                pos1.y = height;
                if (width - initPos.x > initPos.y) {
                    pos2.x = width - (hx + width - initPos.x);
                    pos2.y = height;
                    pos3.x = width;
                    pos3.y = height - ((width - pos2.x) / hx * (hy + initPos.y));
                } else {
                    pos2.x = width;
                    pos2.y = height - (hy + initPos.y);
                    pos3.x = width - (hy + initPos.y) / hy * (hx + width - initPos.x);
                    pos3.y = height;
                }
            } else if (disX > 0 && disY < 0) {    //往右下翻牌
                pos1.x = 0;
                pos1.y = 0;
                if (initPos.x > height - initPos.y) {
                    pos2.x = hx + initPos.x;
                    pos2.y = 0;
                    pos3.x = 0;
                    pos3.y = pos2.x / hx * (hy + height - initPos.y);
                } else {
                    pos2.x = 0;
                    pos2.y = hy + (height - initPos.y);
                    pos3.x = (hy + (height - initPos.y)) / hy * hx + initPos.x;
                    pos3.y = 0;
                }
            } else if (disX < 0 && disY < 0) {    //往左下翻牌
                pos1.x = width;
                pos1.y = 0;
                if (width - initPos.x > height - initPos.y) {
                    pos2.x = width - (hx + width - initPos.x);
                    pos2.y = 0;
                    pos3.x = width;
                    pos3.y = (width - pos2.x) / hx * (hy + height - initPos.y);
                } else {
                    pos2.x = width;
                    pos2.y = hy + (height - initPos.y);
                    pos3.x = width - (hy + (height - initPos.y)) / hy * (hx + width - initPos.x);
                    pos3.y = 0;
                }
            }

            let xlist = new Vec3(pos1.x, pos2.x, pos3.x);
            let ylist = new Vec3(pos1.y, pos2.y, pos3.y);
            XYData.xlist = xlist;
            XYData.ylist = ylist;
        }
        return XYData;
    }

    setxy() {
        let initPos = new Vec2(this.initPos.x, this.initPos.y);
        let movePos = new Vec2(this.movePos.x, this.movePos.y);
        if (this._backMaterialNode.angle == -90) {
            initPos.x = this._box.height - this.initPos.y;
            initPos.y = this.initPos.x;
            movePos.x = this._box.height - this.movePos.y;
            movePos.y = this.movePos.x;
        } else if (this._backMaterialNode.angle == -180) {
            initPos.x = this._box.width - this.initPos.x;
            initPos.y = this._box.height - this.initPos.y;
            movePos.x = this._box.width - this.movePos.x;
            movePos.y = this._box.height - this.movePos.y;
        } else if (this._backMaterialNode.angle == -270) {
            initPos.x = this.initPos.y;
            initPos.y = this._box.width - this.initPos.x;
            movePos.x = this.movePos.y;
            movePos.y = this._box.width - this.movePos.x;
        }
        let xyData1 = this.getXYData(initPos, movePos, this._initBox.width, this._initBox.height);
        this._backMaterial.setProperty('disX', xyData1.disX);
        this._backMaterial.setProperty('disY', xyData1.disY);
        this._backMaterial.setProperty('xlist', xyData1.xlist);
        this._backMaterial.setProperty('ylist', xyData1.ylist);

        this._frontMaterial.setProperty('disX', xyData1.disX);
        this._frontMaterial.setProperty('disY', xyData1.disY);
        this._frontMaterial.setProperty('xlist', xyData1.xlist);
        this._frontMaterial.setProperty('ylist', xyData1.ylist);

        let xyData2 = this.getXYData(this.initPos, this.movePos, this._box.width, this._box.height);
        this._frontMaterial.setProperty('disXSymmetricPos', xyData2.disX);
        this._frontMaterial.setProperty('disYSymmetricPos', xyData2.disY);
        this._frontMaterial.setProperty('xlistSymmetricPos', xyData2.xlist);
        this._frontMaterial.setProperty('ylistSymmetricPos', xyData2.ylist);
    }
}

