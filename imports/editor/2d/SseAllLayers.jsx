import React from 'react';
import {Eye, EyeOff} from 'mdi-material-ui';
import SseMsg from "../../common/SseMsg";

export default class SseAllLayers extends React.Component {

    constructor() {
        super();
        SseMsg.register(this);

        this.state = {
            layersMap: null,
            classesMap: null,
            selectedLayer: 0,
        };
    };

    componentDidMount() {
        this.onMsg("editor-ready", (arg) => {
            const layersMap = arg.value.objects.reduce((acc, obj) => {
                if (!acc.layersMap[obj.classIndex]) {
                    acc.layersMap[obj.classIndex] = {
                        layers: 1, visiblePaths: 1,
                    };

                    return acc;
                }
                acc.layersMap[obj.classIndex].layers++;
                acc.layersMap[obj.classIndex].visiblePaths++;

                return acc;
            }, { layersMap: {} });

            this.setState(layersMap);
        });

        this.onMsg("update-layers-list", (paths) => {
            const layersMap = paths.reduce((acc, path) => {
                const classIndex = path.feature.classIndex;

                if (!acc.layersMap[classIndex]) {
                    acc.layersMap[classIndex] = {
                        layers: 1, visiblePaths: path.visible ? 1 : 0,
                    };

                    return acc;
                }
                acc.layersMap[classIndex].layers++;

                if (path.visible) {
                    acc.layersMap[classIndex].visiblePaths++;
                }

                return acc;
            }, { layersMap: {} });

            this.setState(layersMap);
        });

        this.onMsg("active-soc", (arg) => {
            const classesMap = arg.value._config.objects.reduce((acc, obj) => ({
                ...acc,
                [obj.classIndex]: obj,
            }), {});

            this.setState({ classesMap });
        });
    }

    toggleClass = (classIndex) => () => {
        const newLayers = { ...this.state.layersMap };

        if (newLayers[classIndex].visiblePaths > 0) {
            newLayers[classIndex].visiblePaths = 0;    
        } else {
            newLayers[classIndex].visiblePaths = newLayers[classIndex].layers;
        }

        this.setState({
            layersMap: newLayers,
        });

        if (newLayers[classIndex].visiblePaths)
            this.sendMsg("class-show", { index: +classIndex });
        else
            this.sendMsg("class-hide", { index: +classIndex });
    }

    changeClass = (idx) => () => {
        this.setState({ selectedLayer: +idx });
        this.sendMsg("classSelection", {
            descriptor: { classIndex: +idx }
        });
    }

    render() {
        const { layersMap, classesMap, selectedLayer } = this.state;

        return (
            <div>
                <h1>All Layers</h1>
                {
                    layersMap && classesMap ?
                        Object.entries(layersMap).map(([layerClassIndex, data]) => (
                            <div
                                key={layerClassIndex}
                                className="sse-layer hflex flex-align-items-center"
                                style={{
                                    backgroundColor: classesMap[layerClassIndex].color,
                                }}
                            >
                                <div className={selectedLayer == layerClassIndex ? "selected" : ""}>
                                    <div onClick={this.toggleClass(layerClassIndex)} className="sse-layer-eye">
                                        {data.visiblePaths > 0 ? <Eye/> : <EyeOff/>}</div>
                                    <div
                                        className="grow flex-align-items-center"
                                        onClick={this.changeClass(layerClassIndex)}
                                    >
                                        <div className="p5 grow">
                                            {classesMap[layerClassIndex].label}&nbsp;({data.layers})
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                        : undefined
                }

            </div>
        );
    }
}
