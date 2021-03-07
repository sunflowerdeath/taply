import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import Taply from '../'

const style = document.createElement('style')
style.innerText = `
.test:hover {color:blue}
.test:active {color:red}
`
document.head.appendChild(style)

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
		{(tapState, ref) => (
			<div style={getButtonStyle({ isDisabled, tapState })} ref={ref}>
				{children}
			</div>
		)}
	</Taply>
)

const StateButton = ({ isDisabled, isFocusable, onTap, children }) => {
	const [tapState, setTapState] = useState({})
	const ref = (ref) => console.log('ref: ', ref)
	return (
		<Taply
			onTap={onTap}
			onChangeTapState={setTapState}
			isDisabled={isDisabled}
			isFocusable={isFocusable}
		>
			<div style={getButtonStyle({ isDisabled, tapState })} ref={ref}>
				{children}
			</div>
		</Taply>
	)
}

const Link = ({ isDisabled, children, isFocusable, href, onTap }) => (
	<Taply onTap={onTap} isDisabled={isDisabled} isFocusable={isFocusable}>
		{({ isPressed, isHovered, isFocused }, ref) => {
			let color = 'black'
			if (isDisabled) {
				color = '#999'
			} else if (isPressed) color = 'red'
			else if (isHovered) color = 'blue'
			return (
				<a
					ref={ref}
					href={href}
					style={{
						color,
						outline: 'none',
						boxShadow: isFocused ? '0 0 0 2px #0088ff' : 'none'
					}}
				>
					{children}
				</a>
			)
		}}
	</Taply>
)

const RouterLink = ({ isDisabled, children, isFocusable }) => (
	<Link
		href={`http://localhost:1337/${new Date().getTime()}`}
		onTap={(event) => {
			event.preventDefault()
			history.pushState({}, '', new Date().getTime())
		}}
	>
		{children}
	</Link>
)

/*
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

	onPinchEnd(event, touches) {
		console.log('pinch end')
		this.setState({ pinch: false, touches })
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
				<div
					style={{
						width: 250,
						height: 250,
						background: '#ddd',
						WebkitUserSelect: 'none',
						WebkitTapHighlightColor: 'transparent'
					}}
				>
					{tap && 'TAP'}
					{pinch && 'PINCH'}
					{touches.map((touch, index) => (
						<div
							key={index}
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
*/

const onTap = () => console.log('onTap')

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
		<div
			style={{
				overflow: 'scroll',
				width: 200,
				height: 200,
				border: '1px solid grey',
				padding: 10
			}}
		>
			<div style={{ height: 500 }}>
				<InlineButton onTap={onTap}>Inline button</InlineButton>
				<br />
				<br />
				<InlineButton onTap={onTap}>Inline button</InlineButton>
				<br />
				<br />
				<div className="test" tabIndex="0" onClick={onTap}>
					Usual button
				</div>
			</div>
		</div>
		<br />
		<br />
		<Link href="https://google.com" onTap={onTap}>
			Link
		</Link>
		<br />
		<Link href="https://google.com" onTap={onTap} isFocusable={false}>
			Not focusable
		</Link>
		<br />
		<RouterLink>Router Link</RouterLink>
		{/*
		<br />
		<br />
		<PinchExample />
		*/}
	</div>
)

ReactDOM.render(<Example />, document.querySelector('.container'))
