import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import Taply from '../index'

const getButtonStyle = ({ tapState, isDisabled }) => {
	const style = {
		padding: '10px 15px',
		display: 'inline-block',
		cursor: 'default',
		background: '#eee',
		outline: 'none',
		userSelect: 'none'
	}

	if (isDisabled) style.color = '#999'

	const { isHovered, isPressed, isFocused } = tapState
	if (isPressed) {
		style.background = '#333'
		style.color = 'white'
	} else if (isHovered) {
		style.background = '#ccc'
	}

	if (isFocused) {
		style.boxShadow = '0 0 0 2px #0088ff'
	}

	return style
}

const InlineButton = ({ isDisabled, onTap, children, isFocusable }) => (
	<Taply onTap={onTap} isDisabled={isDisabled} isFocusable={isFocusable}>
		{tapState => (
			<div style={getButtonStyle({ isDisabled, tapState })}>{children}</div>
		)}
	</Taply>
)

const Link = ({ isDisabled, children, isFocusable }) => (
	<Taply onTap={onTap} isDisabled={isDisabled} isFocusable={isFocusable}>
		{({ isPressed, isHovered, isFocused }) => (
			<a
				href="https://google.com"
				style={{
					color: do {
						if (isDisabled) '#999'
						else if (isPressed) 'red'
						else if (isHovered) 'blue'
						else 'black'
					},
					outline: 'none',
					boxShadow: isFocused ? '0 0 0 2px #0088ff' : 'none'
				}}
			>
				{children}
			</a>
		)}
	</Taply>
)

class StateButton extends Component {
	state = { tapState: {} }

	render() {
		const { isDisabled, onTap, children, isFocusable } = this.props

		return (
			<Taply
				onTap={onTap}
				onChangeTapState={tapState => this.setState({ tapState })}
				isDisabled={isDisabled}
				isFocusable={isFocusable}
			>
				{tapState => (
					<div style={getButtonStyle({ isDisabled, tapState })}>{children}</div>
				)}
			</Taply>
		)
	}
}

const onTap = () => console.log('onTap')

class PinchExample extends Component {
	constructor() {
		super()

		this.state = {
			touches: []
		}

		this.onTapStart = this.onTapStart.bind(this)
		this.onTapMove = this.onTapMove.bind(this)
		this.onTapEnd = this.onTapEnd.bind(this)
		this.onPinchStart = this.onPinchStart.bind(this)
		this.onPinchMove = this.onPinchMove.bind(this)
		this.onPinchEnd = this.onPinchEnd.bind(this)
	}

	onTapStart(event, touches) {
		console.log('tap start')
		this.setState({ tap: true, touches })
	}

	onTapMove(event, touches) {
		console.log('tap move')
		this.setState({ touches })
	}

	onTapEnd(event, touches) {
		console.log('tap end')
		this.setState({ tap: false, touches })
	}

	onPinchStart(event, touches) {
		console.log('pinch start')
		this.setState({ pinch: true, touches })
	}

	onPinchMove(event, touches) {
		event.preventDefault()
		console.log('pinch move')
		this.setState({ touches })
	}

	onPinchEnd() {
		console.log('pinch end')
		this.setState({ pinch: false })
	}

	render() {
		const { tap, pinch, touches } = this.state
		return (
			<Taply
				onTapStart={this.onTapStart}
				onTapMove={this.onTapMove}
				onTapEnd={this.onTapEnd}
				isPinchable
				onPinchStart={this.onPinchStart}
				onPinchMove={this.onPinchMove}
				onPinchEnd={this.onPinchEnd}
			>
				<div style={{ width: 250, height: 250, background: '#ddd' }}>
					{tap && 'TAP'}
					{pinch && 'PINCH'}
					{touches.map(touch => (
						<div
							style={{
								position: 'absolute',
								top: touch.y - 30,
								left: touch.x - 30,
								width: 60,
								height: 60,
								background: 'red',
								borderRadius: '50%'
							}}
						/>
					))}
				</div>
			</Taply>
		)
	}
}

const Example = () => (
	<div>
		<InlineButton onTap={onTap}>Inline button</InlineButton>{' '}
		<InlineButton onTap={onTap} isFocusable={false}>
			Not focusable
		</InlineButton>{' '}
		<InlineButton onTap={onTap} isDisabled>
			Disabled
		</InlineButton>
		<br />
		<br />
		<StateButton onTap={onTap}>State button</StateButton>{' '}
		<StateButton onTap={onTap} isFocusable={false}>
			Not focusable
		</StateButton>{' '}
		<StateButton onTap={onTap} isDisabled>
			Disabled
		</StateButton>
		<br />
		<br />
		<Link>Link</Link> <Link isFocusable={false}>Not focusable</Link>
		<br />
		<br />
		<PinchExample />
	</div>
)

ReactDOM.render(<Example />, document.querySelector('.container'))
