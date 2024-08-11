import {_decorator, Component, Node} from 'cc';
import {Card} from "./card";

const {ccclass, property} = _decorator;

@ccclass('tween_flip_card_scene')
export class TweenFlipCardScene extends Component {
    @property(Card)
    card: Card = null;

    start() {
        this.card.flipShow(1);
    }

    update(deltaTime: number) {

    }
}
