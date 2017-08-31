
<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
	<header class="entry-header">
		<h1 class="entry-title"><?php the_title(); ?></h1>

		<div class="entry-meta">
			<?php wp_advocate_posted_on(); ?>
		</div><!-- .entry-meta -->
	</header><!-- .entry-header -->
    
    <div class="noimg"></div>

	<div class="entry-content post-content">
		<?php the_content(); ?>
		<?php wp_link_pages( array( 'before' => '<div class="page-link">' . __( 'Pages:', 'wp-advocate' ), 'after' => '</div>' ) ); ?>
	</div><!-- .entry-content -->

	<footer class="entry-meta">
		<?php if ( 'post' == get_post_type() ) : // Hide category and tag text for pages on Search ?>
			<?php
				/* translators: used between list items, there is a space after the comma */
				$categories_list = get_the_category_list( __( ', ', 'wp-advocate' ) );
				if ( $categories_list && wp_advocate_categorized_blog() ) :
			?>
			<span class="cat-links">
				<?php printf( __( '<span class="meta-cat"></span> %1$s', 'wp-advocate' ), $categories_list ); ?>
			</span>

			<?php endif; // End if categories ?>

			<?php
				/* translators: used between list items, there is a space after the comma */
				$tags_list = get_the_tag_list( '', __( ', ', 'wp-advocate' ) );
				if ( $tags_list ) :
			?>
			<span class="tag-links">
				<?php printf( __( '<span class="meta-tag"></span> %1$s', 'wp-advocate' ), $tags_list ); ?>
			</span>

			<?php endif; // End if $tags_list ?>
		<?php endif; // End if 'post' == get_post_type() ?>

		<?php edit_post_link( __( 'Edit', 'wp-advocate' ), '<span class="edit-link">', '</span>' ); ?>
	</footer><!-- .entry-meta -->
</article><!-- #post-<?php the_ID(); ?> -->
