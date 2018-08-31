import React from 'react';
import {Eye, EyeOff} from 'mdi-material-ui';
import SseMsg from "../../common/SseMsg";

export default class SseAllLayers extends React.Component {

    constructor() {
        super();
        SseMsg.register(this);
        this.state = {
            classes: {},
            selected: 0,
        };
    };

    componentDidMount() {
        this.onMsg("currentSample", (arg) => {
            const layerClasses = arg.data.objects.reduce((acc, obj) => {
                if (!acc.classes[obj.classIndex]) {
                    acc.classes[obj.classIndex] = { layers: [obj], isVisible: true }
                    return acc;
                }
                acc.classes[obj.classIndex].layers.push(obj);
                return acc;
            }, { classes: {} });
            console.log(Object.entries(layerClasses));
            this.setState(layerClasses);
        });
    }

    toggleClass(classIndex) {
        const newClasses = { ...this.state.classes };
        newClasses[classIndex].isVisible = !newClasses[classIndex].isVisible;

        this.setState({
            classes: newClasses,
        });

        if (newClasses[classIndex].isVisible)
            this.sendMsg("class-show", { index: classIndex });
        else
            this.sendMsg("class-hide", { index: classIndex });
    }

    changeClass(idx) {
        this.setState({ selected: idx });
        this.sendMsg("classSelection", {
            descriptor: { classIndex: idx }
        });
    }

    render() {
        return (
            <div>
                <h1>All Layers</h1>
                {Object.entries(this.state.classes).map(([className, data]) => (
                    <div key={className} className="sse-layer hflex flex-align-items-center">
                        <div className={this.state.selected == className ? "selected" : ""}>
                            <div onClick={() => this.toggleClass(className)} className="sse-layer-eye">
                                {data.isVisible ? <Eye/> : <EyeOff/>}</div>
                            <div className="grow flex-align-items-center"
                                 onClick={() => this.changeClass(className)}>
                                <div className="p5 grow">Class index:{className}&nbsp;({data.layers.length})</div>
                            </div>
                        </div>
                    </div>
                ))}

            </div>
        );
    }
}
