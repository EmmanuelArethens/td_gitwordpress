<?php

/***** Fetch Theme Data *****/

$mh_magazine_lite_data = wp_get_theme('mh-magazine-lite');
$mh_magazine_lite_version = $mh_magazine_lite_data['Version'];
$mh_musicmag_data = wp_get_theme('mh-musicmag');
$mh_musicmag_version = $mh_musicmag_data['Version'];

/***** Load Google Fonts *****/

function mh_musicmag_fonts() {
	wp_dequeue_style('mh-google-fonts');
	wp_enqueue_style('mh-musicmag-fonts', 'https://fonts.googleapis.com/css?family=Hind:400,600,700|Marcellus+SC', array(), null);
}
add_action('wp_enqueue_scripts', 'mh_musicmag_fonts', 11);

/***** Load Stylesheets *****/

function mh_musicmag_styles() {
	global $mh_magazine_lite_version, $mh_musicmag_version;
    wp_enqueue_style('mh-magazine-lite', get_template_directory_uri() . '/style.css', array(), $mh_magazine_lite_version);
    wp_enqueue_style('mh-musicmag', get_stylesheet_uri(), array('mh-magazine-lite'), $mh_musicmag_version);
    if (is_rtl()) {
		wp_enqueue_style('mh-magazine-lite-rtl', get_template_directory_uri() . '/rtl.css', array(), $mh_magazine_lite_version);
	}
}
add_action('wp_enqueue_scripts', 'mh_musicmag_styles');

/***** Load Translations *****/

function mh_musicmag_theme_setup(){
	load_child_theme_textdomain('mh-musicmag', get_stylesheet_directory() . '/languages');
}
add_action('after_setup_theme', 'mh_musicmag_theme_setup');

/***** Change Defaults for Custom Colors *****/

function mh_musicmag_custom_colors() {
	remove_theme_support('custom-background');
	remove_theme_support('custom-header');
	add_theme_support('custom-background', array('default-color' => '161616'));
	add_theme_support('custom-header', array('default-image' => '', 'default-text-color' => 'ffffff', 'width' => 300, 'height' => 100, 'flex-width' => true, 'flex-height' => true));
}
add_action('after_setup_theme', 'mh_musicmag_custom_colors');

/***** Remove Functions from Parent Theme *****/

function mh_musicmag_remove_parent_functions() {
    remove_action('admin_menu', 'mh_magazine_lite_theme_info_page');
    remove_action('admin_notices', 'mh_magazine_lite_admin_notice');
}
add_action('wp_loaded', 'mh_musicmag_remove_parent_functions');

?>