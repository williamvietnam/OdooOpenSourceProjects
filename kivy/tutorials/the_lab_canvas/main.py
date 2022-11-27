from kivy.app import App
from kivy.metrics import dp
from kivy.properties import StringProperty, BooleanProperty
from kivy.uix.anchorlayout import AnchorLayout
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.button import Button
from kivy.uix.gridlayout import GridLayout
from kivy.uix.stacklayout import StackLayout
from kivy.uix.widget import Widget


class WidgetsExample(GridLayout):
    count = 1
    count_enabled = BooleanProperty(False)
    my_text = StringProperty("1")
    text_input_str = StringProperty("foo")
    # slider_value_txt = StringProperty("Value")

    def on_button_click(self):
        print("Button clicked")
        if self.count_enabled:
            self.count += 1
            self.my_text = str(self.count)

    def on_toggle_button_state(self, widget):
        print("toggle state: " + widget.state)
        if widget.state == "normal":
            widget.text = "OFF"
            self.count_enabled = False
        else:
            widget.text = "ON"
            self.count_enabled = True

    def on_switch_active(self, widget):
        print("Switch: " + str(widget.active))

    # def on_slider_value(self, widget):
     #   print("Slider: " + str(int(widget.value)))
        # self.slider_value_txt = str(int(widget.value))

    def on_text_validate(self, widget):
        self.text_input_str = widget.text




class StackLayoutExample(StackLayout):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # self.orientation = "lr-bt"
        for i in range(0, 100):
            #size = dp(100) + i*10
            size = dp(100)
            b = Button(text=str(i+1), size_hint=(None, None), size=(size, size))
            self.add_widget(b)

#class GridLayoutExample(GridLayout):
#    pass


class AnchorLayoutExample(AnchorLayout):
    pass


class BoxLayoutExample(BoxLayout):
    pass
"""    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.orientation = "vertical"
        b1 = Button(text="A")
        b2 = Button(text="B")
        b3 = Button(text="C")

        self.add_widget(b1)
        self.add_widget(b2)
        self.add_widget(b3)
"""


class MainWidget(Widget):
    pass


class TheLabApp(App):
    pass


class CanvasExample1(Widget):
    pass

class CanvasExample2(Widget):
    pass

class CanvasExample3(Widget):
    pass


class CanvasExample4(Widget):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        with self.canvas:
            Line(points=(100, 100, 400, 500), width=2)
            Color(0, 1, 0)
            Line(circle=(400, 200, 80), width=2)
            Line(rectangle=(700, 500, 150, 100), width=5)
            self.rect = Rectangle(pos=(700, 200), size=(150, 100))

    def on_button_a_click(self):
        #print("foo")
        x, y = self.rect.pos
        w, h = self.rect.size
        inc = dp(10)

        diff = self.width - (x+w)
        if diff < inc:
            inc = diff

        x += inc
        self.rect.pos = (x, y)



class CanvasExample5(Widget):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.ball_size = dp(50)
        self.vx = dp(3)
        self.vy = dp(4)
        with self.canvas:
            self.ball = Ellipse(pos=self.center, size=(self.ball_size, self.ball_size))
        Clock.schedule_interval(self.update, 1/60)

    def on_size(self, *args):
        # print("on size : " + str(self.width) + ", " + str(self.height))
        self.ball.pos = (self.center_x-self.ball_size/2, self.center_y-self.ball_size/2)

    def update(self, dt):
        # print("update")
        x, y = self.ball.pos

        x += self.vx
        y += self.vy

        #  self.ball_size / self.width
        # self.vx = - self.vx
        if y + self.ball_size > self.height:
            y = self.height-self.ball_size
            self.vy = -self.vy
        if x + self.ball_size > self.width:
            x = self.width-self.ball_size
            self.vx = -self.vx
        if y < 0:
            y = 0
            self.vy = -self.vy
        if x < 0:
            x = 0
            self.vx = -self.vx

        self.ball.pos = (x, y)


class CanvasExample6(Widget):
    pass

class CanvasExample7(BoxLayout):
    pass


TheLabApp().run()
