import {_decorator, Component, Node} from 'cc';
import {Card} from "db://assets/scripts/one_sprite/card";

const {ccclass, property} = _decorator;

@ccclass('one_sprite_card_scene')
export class OneSpriteCardScene extends Component {
    @property(Card)
    card: Card = null;

    start() {
        this.card.flipShow(1);
    }

    update(deltaTime: number) {

    }
}
