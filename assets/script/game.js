cc.Class({
    extends: cc.Component,

    properties: {
        targetNode: cc.Node,
        knifeNode: cc.Node,
        knifePrefab: cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    // 扔飞刀
    throwKnife(){
        if(this.canthrowKnife){
            this.canthrowKnife = false;
            this.knifeNode.runAction(cc.sequence(
                cc.moveTo(0.25,cc.v2(this.knifeNode.x,this.targetNode.y)),
                cc.callFunc(()=>{
                    let isHit = false;
                    let gap = 8;
                    // 判断是否碰到前面已经插上的刀
                    for (let knifeNode of this.knifeNodeArr) {
                        if (Math.abs(knifeNode.angle) < gap || (360 -Math.abs(knifeNode.angle)) < gap){
                            isHit = true;
                            break;
                        }
                    }

                    if(isHit){
                        // 撞到了,那么刀要弹回去
                        this.knifeNode.runAction(cc.sequence(
                            cc.spawn(
                                cc.moveTo(0.35,cc.v2(this.knifeNode.x, -cc.winSize.height)),
                                cc.rotateTo(0.35, 30)
                            ),
                            cc.callFunc(()=>{
                                console.log("游戏结束");
                                cc.director.loadScene('game');//重启游戏
                            })
                        ));
                    }else{
                        // 通过预制体生成一把扎在target上面的小刀
                        let knifeNode = cc.instantiate(this.knifePrefab);
                        knifeNode.setPosition(this.knifeNode.position);
                        // 添加到当前节点中
                        this.node.addChild(knifeNode);
                        this.knifeNodeArr.push(knifeNode);
                        // console.log(this.knifeNodeArr.length);

                        // 飞刀回到起始位置
                        this.knifeNode.setPosition(cc.v2(0,-300));
                        this.canthrowKnife = true;
                    }
                })
            ));
        }
    },

    // 木桩变速
    changeSpeed(){
        let dir = Math.random()>0.5?1:-1;//方向
        let speed = 1+ Math.random()*4;//速度
        this.targetRotationSpeed = dir * speed;
    },

    onLoad () {
        this.canthrowKnife = true;
        this.targetNode.zIndex = 1;
        this.targetRotationSpeed = 3;
        this.knifeNodeArr = [];

        // 每隔一段时间改变速度
        setInterval(()=>{
            this.changeSpeed();
        },2000);

        this.node.on('touchstart', this.throwKnife,this);
    },

    onDestroy(){
        this.node.off('touchstart', this.throwKnife,this);

    },
    

    update (dt) {
        this.targetNode.angle = (this.targetNode.angle + this.targetRotationSpeed)%360;

        // 扎在target上的刀要一起转动
        for (let knifeNode of this.knifeNodeArr) {
            knifeNode.angle = (knifeNode.angle + this.targetRotationSpeed)%360;
        }
    },
});
