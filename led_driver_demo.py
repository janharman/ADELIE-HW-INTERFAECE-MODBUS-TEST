# Demo schematic: simple buck-type constant-current LED driver
# Sample output to demonstrate schematic generation capability.
import schemdraw
import schemdraw.elements as elm

with schemdraw.Drawing(file='led_driver_demo.png', show=False) as d:
	d.config(unit=3, fontsize=12)

	# Input supply
	Vin = d.add(elm.SourceV().up().label('Vin\n12V'))
	d.add(elm.Line().right())

	# Controller IC (generic buck LED driver controller, e.g. similar to MP3302/AL8860 family)
	ic = d.add(elm.Ic(pins=[
			elm.IcPin(name='VIN', side='left'),
			elm.IcPin(name='SW', side='right'),
			elm.IcPin(name='FB', side='right'),
			elm.IcPin(name='GND', side='bottom'),
		], w=2.5, h=2.5).label('LED Driver\nIC (Buck)', loc='top'))

	# Switch node -> inductor -> LED string
	d.add(elm.Line().right().at(ic.SW))
	L1 = d.add(elm.Inductor().right().label('L1\n33uH'))

	# Freewheeling (catch) diode from switch node to ground
	d.push()
	D1 = d.add(elm.Diode().down().reverse().label('D1', loc='bottom'))
	d.add(elm.Line().left().to(ic.GND).dot())
	d.pop()

	# LED string (3x series LEDs) after inductor
	d.add(elm.Line().right())
	led1 = d.add(elm.LED().right().label('LED1'))
	led2 = d.add(elm.LED().right().label('LED2'))
	led3 = d.add(elm.LED().right().label('LED3'))

	# Current sense resistor back to FB pin, closing the loop to ground
	d.add(elm.Line().down())
	Rsense = d.add(elm.ResistorIEC().left().label('Rsense\n0.33R', loc='bottom'))
	d.add(elm.Line().left().to(ic.GND).dot())

	# Output capacitor across LED string for ripple filtering
	d.push()
	Cout = d.add(elm.Capacitor().down().at(led1.start).label('Cout\n1uF'))
	d.add(elm.Line().left().to(ic.GND))
	d.pop()

	# Ground reference symbol
	d.add(elm.Ground().at(ic.GND))

print('Schematic saved as led_driver_demo.png')
